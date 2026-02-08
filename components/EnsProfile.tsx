import React from 'react';
import { useEnsAvatar, useEnsText } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { normalize } from 'viem/ens';

/** Returns true if the display name looks like an ENS name (e.g. alice.eth). */
function looksLikeEnsName(name: string | undefined): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 4 && /\.eth$/i.test(trimmed);
}

interface EnsProfileProps {
  /** Researcher display name: either an ENS name (e.g. alice.eth) or a short address. */
  name: string;
  /** Optional: show description from ENS text record (ENSIP-5). */
  showDescription?: boolean;
  className?: string;
}

/**
 * Shows avatar, description, url, and com.twitter from ENS when name is an ENS name.
 * Uses wagmi useEnsAvatar + useEnsText (ENSIP-5 records) for portable profiles and social links.
 * No hard-coded values; resolution is on mainnet.
 */
export const EnsProfile: React.FC<EnsProfileProps> = ({
  name,
  showDescription = true,
  className = '',
}) => {
  const isEns = looksLikeEnsName(name);
  let normalized: string | undefined;
  try {
    normalized = isEns ? normalize(name.trim()) : undefined;
  } catch {
    normalized = undefined;
  }

  const { data: avatar } = useEnsAvatar({
    name: normalized,
    chainId: mainnet.id,
  });
  const { data: description } = useEnsText({
    name: normalized ?? '',
    key: 'description',
    chainId: mainnet.id,
  });
  const { data: url } = useEnsText({
    name: normalized ?? '',
    key: 'url',
    chainId: mainnet.id,
  });
  const { data: twitter } = useEnsText({
    name: normalized ?? '',
    key: 'com.twitter',
    chainId: mainnet.id,
  });

  if (!isEns || !normalized) {
    return <span className={className}>By {name}</span>;
  }

  const twitterHandle = twitter?.replace(/^@/, '');
  const twitterUrl = twitterHandle ? `https://x.com/${twitterHandle}` : null;

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : null}
        <span className="text-sm font-medium text-slate-500">By {name}</span>
      </div>
      {showDescription && description ? (
        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{description}</p>
      ) : null}
      {(url || twitterUrl) && (
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          {url ? (
            <a
              href={url.startsWith('http') ? url : `https://${url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline truncate max-w-[180px]"
            >
              Website
            </a>
          ) : null}
          {twitterUrl ? (
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:underline"
            >
              @{twitterHandle}
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
};
