/**
 * IPFS integration via Pinata.
 * Study metadata (title, description, background, consent, questions) is stored as JSON on IPFS.
 * No PII in metadata.
 */

const PINATA_PIN_JSON = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
const GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export interface StudyMetadata {
  title: string;
  description?: string;
  background?: string;
  consent?: string;
  questions?: string[];
  eligibility?: string;
  location?: string;
  category?: string;
}

function getJwt(): string | null {
  const j = import.meta.env.VITE_PINATA_JWT;
  return (typeof j === 'string' && j.trim()) ? j.trim() : null;
}

export function isIpfsConfigured(): boolean {
  return !!getJwt();
}

/**
 * Upload study metadata as JSON to IPFS (Pinata). Returns CID or null.
 */
export async function uploadStudyMetadata(
  metadata: StudyMetadata
): Promise<string | null> {
  const jwt = getJwt();
  if (!jwt) return null;

  try {
    const res = await fetch(PINATA_PIN_JSON, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
      }),
    });

    if (!res.ok) {
      console.error('Pinata upload failed', res.status, await res.text());
      return null;
    }

    const data = (await res.json()) as { IpfsHash?: string };
    return data.IpfsHash ?? null;
  } catch (e) {
    console.error('IPFS upload error', e);
    return null;
  }
}

/**
 * Fetch study metadata JSON by CID from IPFS gateway. Returns null on failure.
 */
export async function getStudyMetadata(
  cid: string
): Promise<StudyMetadata | null> {
  if (!cid.trim()) return null;
  const normalized = cid.replace(/^ipfs:\/\//, '').trim();

  const urls = [
    `${GATEWAY}/${normalized}`,
    `https://ipfs.io/ipfs/${normalized}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = (await res.json()) as StudyMetadata;
      if (data && typeof data.title === 'string') return data;
      return null;
    } catch {
      continue;
    }
  }
  return null;
}
