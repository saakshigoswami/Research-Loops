
export enum UserRole {
  RESEARCHER = 'RESEARCHER',
  SUBJECT = 'SUBJECT'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  expertise?: string[];
  location?: string;
  avatarColor?: string;
  linkedInUrl?: string;
}

/** Participant profile (saved for login / join research flow) */
export interface ParticipantProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise?: string[];
  location?: string;
  linkedInUrl?: string;
  createdAt: string;
}

export interface ResearchStudy {
  id: string;
  title: string;
  description: string;
  category: 'Product Testing' | 'Surveys' | 'Psychology' | 'Medical' | 'Technology' | 'Nutrition' | 'Economics' | 'Behavioral Science' | 'Neuroscience';
  eligibility: string;
  location: string;
  compensation: number;
  researcherId: string;
  researcherName: string;
  createdAt: string;
  participantCount: number;
  status: 'OPEN' | 'CLOSED';
  /** Set when study metadata is stored on IPFS */
  ipfsCid?: string;
  /** Max participants (from DB); used when editing */
  maxParticipants?: number;
  /** Yellow Network: app session id when study is funded */
  yellowSessionId?: string | null;
  /** Yellow Network: amount locked in session (e.g. USDC) */
  fundedAmount?: number | null;
}

export interface Application {
  id: string;
  studyId: string;
  userId: string;
  userName: string;
  appliedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface Collaboration {
  id: string;
  researcherId: string;
  researcherName: string;
  field: string;
  goal: string;
  status: 'ACTIVE' | 'MATCHED';
}

export interface DataAsset {
  id: string;
  title: string;
  description: string;
  field: string;
  format: string;
  recordCount: number;
  ownerId: string;
  ownerName: string;
  createdAt: string;
}
