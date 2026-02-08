import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { UserRole, ResearchStudy, Collaboration, DataAsset } from './types';
import { StudyCard } from './components/StudyCard';
import { generateStudyContent } from './services/geminiService';
import { isSupabaseConfigured } from './lib/supabase';
import { fetchStudies, createStudy, fetchResearcherStudies, updateStudy, deleteStudy, getOrCreateResearcher, setStudyFunding } from './lib/studyService';
import { joinStudy, fetchParticipantEnrollments, ensureParticipant, markEnrollmentCompleted, markEnrollmentsPaidForStudy, type EnrollmentWithStudy } from './lib/participantService';
import { createStudyFundingSession, settleStudySession, creditParticipantInSession } from './lib/yellow';
import { getProfile, setProfile, hasMinimalProfile } from './lib/profileService';
import { isIpfsConfigured, uploadStudyMetadata } from './lib/ipfs';
import type { StudyMetadata } from './lib/ipfs';

export interface AppProps {
  mode: 'researcher' | 'participant';
  address: string;
  participantTab?: 'studies' | 'my-dashboard';
}

function shortAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const App: React.FC<AppProps> = ({ mode, address, participantTab = 'studies' }) => {
  const navigate = useNavigate();
  // Resolve ENS on mainnet for researcher identity (ENS track)
  const { data: ensName } = useEnsName({
    address: address ? (address as `0x${string}`) : undefined,
    chainId: mainnet.id,
  });
  const [studies, setStudies] = useState<ResearchStudy[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [dataAssets, setDataAssets] = useState<DataAsset[]>([]);
  const [researcherId, setResearcherId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-dashboard' | 'collaborate' | 'data-exchange' | 'meet-people' | 'trending'>(mode === 'researcher' ? 'dashboard' : participantTab === 'my-dashboard' ? 'my-dashboard' : 'trending');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSubmittingStudy, setIsSubmittingStudy] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [profileRoleFilter, setProfileRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [viewProfileUser, setViewProfileUser] = useState<{ id: string; name: string; role: string; email?: string; bio?: string; expertise?: string[]; location?: string; avatarColor?: string; linkedInUrl?: string } | null>(null);
  const [profiles, setProfiles] = useState<{ id: string; name: string; email?: string; role: UserRole; bio?: string; expertise?: string[]; location?: string; avatarColor?: string }[]>([]);

  const categories = [
    'All Categories',
    'Product Testing',
    'Surveys',
    'Psychology',
    'Medical',
    'Technology',
    'Nutrition',
    'Economics',
    'Behavioral Science',
    'Neuroscience'
  ];
  
  const [selectedStudyForApplication, setSelectedStudyForApplication] = useState<ResearchStudy | null>(null);
  const [myDashboardStudies, setMyDashboardStudies] = useState<ResearchStudy[]>([]);
  const [myDashboardEnrollments, setMyDashboardEnrollments] = useState<EnrollmentWithStudy[]>([]);
  const [myDashboardLoading, setMyDashboardLoading] = useState(false);
  const [studyToEdit, setStudyToEdit] = useState<ResearchStudy | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<ResearchStudy | null>(null);
  const [isUpdatingStudy, setIsUpdatingStudy] = useState(false);
  const [showProfileRequiredModal, setShowProfileRequiredModal] = useState(false);
  const [pendingProfileAction, setPendingProfileAction] = useState<{ type: 'apply'; study: ResearchStudy } | { type: 'create-study' } | null>(null);
  const [profileForm, setProfileForm] = useState({ displayName: '', linkedInUrl: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [fundingStudyId, setFundingStudyId] = useState<string | null>(null);
  const [settlingStudyId, setSettlingStudyId] = useState<string | null>(null);
  const [studyToFund, setStudyToFund] = useState<ResearchStudy | null>(null);
  const [studyToSettle, setStudyToSettle] = useState<ResearchStudy | null>(null);
  const [completingEnrollmentId, setCompletingEnrollmentId] = useState<string | null>(null);

  useEffect(() => {
    const mockStudies: ResearchStudy[] = [
      {
        id: 'pt-1',
        title: 'Beta Test: New AR Strategy Game',
        category: 'Product Testing',
        description: 'Join our exclusive beta test for "Aether Conquest," a new augmented reality strategy game. We need feedback on unit balancing, UI responsiveness, and immersion.',
        eligibility: 'Must own an iPhone 13+ or Samsung S22+. Experience with AR games preferred.',
        location: 'Remote / TestFlight',
        compensation: 40,
        researcherId: 'res-default',
        researcherName: 'GameStudio X',
        createdAt: new Date().toISOString(),
        participantCount: 8,
        status: 'OPEN'
      },
      {
        id: 'sv-1',
        title: 'Consumer Habits Survey: Sustainable Fashion',
        category: 'Surveys',
        description: 'A quick 15-minute survey regarding your purchasing habits and attitudes towards sustainable and ethically sourced clothing brands.',
        eligibility: 'Ages 18-65. Must have purchased clothing online in the last 3 months.',
        location: 'Online Survey',
        compensation: 10,
        researcherId: 'res-default',
        researcherName: 'Fashion Research Inst.',
        createdAt: new Date().toISOString(),
        participantCount: 150,
        status: 'OPEN'
      },
      {
        id: 'psy-1',
        title: 'Stress and Remote Work: Psychological Impact Study',
        category: 'Psychology',
        description: 'We are studying how remote work affects stress levels and work-life balance. Includes short daily check-ins over 2 weeks and one 30-min interview.',
        eligibility: 'Employed full-time, working remotely at least 3 days/week. Ages 25-55.',
        location: 'Online + Video Call',
        compensation: 85,
        researcherId: 'res-default',
        researcherName: 'Dr. Sarah Chen',
        createdAt: new Date().toISOString(),
        participantCount: 42,
        status: 'OPEN'
      },
      {
        id: 'med-1',
        title: 'Wearable Device Validation for Heart Rate Accuracy',
        category: 'Medical',
        description: 'Compare consumer wearables (Apple Watch, Fitbit, Garmin) against medical-grade ECG. One in-lab session (2 hours) plus 1 week of at-home wear.',
        eligibility: 'Adults 18+, no known cardiac conditions. Must own at least one listed wearable.',
        location: 'Boston, MA (in-person) + Remote',
        compensation: 200,
        researcherId: 'res-default',
        researcherName: 'Boston Medical Center',
        createdAt: new Date().toISOString(),
        participantCount: 28,
        status: 'OPEN'
      },
      {
        id: 'tech-1',
        title: 'Voice Assistant Usability Study',
        category: 'Technology',
        description: 'Test a new voice assistant prototype. Tasks include setting reminders, asking questions, and smart home commands. Session lasts ~45 minutes.',
        eligibility: 'Fluent English, experience with Alexa/Google Home/Siri. Ages 18+.',
        location: 'Remote (screen share)',
        compensation: 50,
        researcherId: 'res-default',
        researcherName: 'TechUX Labs',
        createdAt: new Date().toISOString(),
        participantCount: 65,
        status: 'OPEN'
      },
      {
        id: 'nut-1',
        title: 'Plant-Based Diet and Energy Levels Survey',
        category: 'Nutrition',
        description: 'Short survey (20 min) on diet choices and self-reported energy. Optional 1-week food diary for extra compensation.',
        eligibility: 'Ages 18+. No dietary restrictions for participation.',
        location: 'Online Survey',
        compensation: 25,
        researcherId: 'res-default',
        researcherName: 'Nutrition Research Co.',
        createdAt: new Date().toISOString(),
        participantCount: 310,
        status: 'OPEN'
      },
      {
        id: 'eco-1',
        title: 'Cryptocurrency and Savings Behavior',
        category: 'Economics',
        description: 'Academic study on how exposure to crypto affects traditional savings behavior. One 30-min survey and optional follow-up in 6 months.',
        eligibility: 'US resident, 21+. Some familiarity with investing or crypto preferred.',
        location: 'Online Survey',
        compensation: 35,
        researcherId: 'res-default',
        researcherName: 'Prof. Michael Rodriguez',
        createdAt: new Date().toISOString(),
        participantCount: 189,
        status: 'OPEN'
      },
      {
        id: 'beh-1',
        title: 'Decision-Making Under Time Pressure',
        category: 'Behavioral Science',
        description: 'Computer-based tasks measuring choices under time limits. Single session, ~1 hour. No prior experience needed.',
        eligibility: 'Ages 18-70, fluent in English. Normal or corrected vision.',
        location: 'Remote (browser-based)',
        compensation: 60,
        researcherId: 'res-default',
        researcherName: 'Decision Lab UK',
        createdAt: new Date().toISOString(),
        participantCount: 94,
        status: 'OPEN'
      },
      {
        id: 'neuro-1',
        title: 'Memory and Sleep Quality: Online Questionnaire',
        category: 'Neuroscience',
        description: 'Survey on sleep habits and self-reported memory (e.g., recall of daily events). Takes about 25 minutes. Part of a larger sleep-memory study.',
        eligibility: 'Ages 18-65. No diagnosed sleep disorders required.',
        location: 'Online Survey',
        compensation: 30,
        researcherId: 'res-default',
        researcherName: 'Marcus Thorne',
        createdAt: new Date().toISOString(),
        participantCount: 220,
        status: 'OPEN'
      },
      {
        id: 'sv-2',
        title: 'Social Media Use and Well-Being (Quick Poll)',
        category: 'Surveys',
        description: '5-minute poll on daily social media use and mood. Anonymous. Results used for academic publication.',
        eligibility: 'Ages 16+. Active on at least one social platform.',
        location: 'Online',
        compensation: 5,
        researcherId: 'res-default',
        researcherName: 'Wellbeing Research Inst.',
        createdAt: new Date().toISOString(),
        participantCount: 1200,
        status: 'OPEN'
      },
      {
        id: 'pt-2',
        title: 'Smart Home Hub Beta: Setup and Voice Control',
        category: 'Product Testing',
        description: 'Test our new smart home hub (provided). Install, connect devices, run voice commands. 2-week in-home trial + 2 feedback calls.',
        eligibility: 'US only. Home with WiFi. Willing to install provided hardware temporarily.',
        location: 'At Home (device shipped)',
        compensation: 120,
        researcherId: 'res-default',
        researcherName: 'HomeTech Inc.',
        createdAt: new Date().toISOString(),
        participantCount: 15,
        status: 'OPEN'
      },
      {
        id: 'med-2',
        title: 'Meditation App Efficacy Trial',
        category: 'Medical',
        description: '4-week trial of a meditation app with weekly short surveys. Measures stress and sleep self-reports. App access provided.',
        eligibility: 'Ages 18+, smartphone. No regular meditation practice in past 6 months.',
        location: 'Remote (app + surveys)',
        compensation: 75,
        researcherId: 'res-default',
        researcherName: 'Mindfulness Research Group',
        createdAt: new Date().toISOString(),
        participantCount: 156,
        status: 'OPEN'
      },
      {
        id: 'psy-2',
        title: 'Gaming and Cognitive Flexibility',
        category: 'Psychology',
        description: 'Play selected puzzle/strategy games online and complete cognitive tests before and after. Total time ~3 hours over 2 sessions.',
        eligibility: 'Ages 18-40. Comfortable with PC gaming. No professional esports experience.',
        location: 'Remote',
        compensation: 90,
        researcherId: 'res-default',
        researcherName: 'Cognitive Gaming Lab',
        createdAt: new Date().toISOString(),
        participantCount: 33,
        status: 'OPEN'
      },
      {
        id: 'tech-2',
        title: 'Password Manager Usability Study',
        category: 'Technology',
        description: 'Try a new password manager prototype and report on setup flow, daily use, and recovery. One 60-min session with screen share.',
        eligibility: 'Uses at least 5 online accounts. No current enterprise password manager.',
        location: 'Remote',
        compensation: 55,
        researcherId: 'res-default',
        researcherName: 'SecurityUX',
        createdAt: new Date().toISOString(),
        participantCount: 22,
        status: 'OPEN'
      },
      {
        id: 'neuro-2',
        title: 'Attention and Multitasking (Online Tasks)',
        category: 'Neuroscience',
        description: 'Browser-based attention and multitasking tasks. Single session ~40 min. Helps validate a new digital attention battery.',
        eligibility: 'Ages 18-60. Quiet environment, stable internet. No ADHD diagnosis required.',
        location: 'Remote',
        compensation: 45,
        researcherId: 'res-default',
        researcherName: 'Attention Lab',
        createdAt: new Date().toISOString(),
        participantCount: 78,
        status: 'OPEN'
      }
    ];

    const mockProfiles: { id: string; name: string; email?: string; role: UserRole; bio?: string; expertise?: string[]; location?: string; avatarColor?: string; linkedInUrl?: string }[] = [
      {
        id: 'p1',
        name: 'Dr. Sarah Chen',
        email: 'sarah@lab.edu',
        role: UserRole.RESEARCHER,
        bio: 'Lead Neuroscientist at Stanford Behavioral Lab, focusing on cognitive responses in virtual environments and AR/VR applications. Published 40+ papers on attention and memory. Currently running studies on remote work and stress. Open to collaboration on cross-disciplinary projects.',
        expertise: ['Neuroscience', 'AR/VR', 'Psychology', 'Cognitive Science', 'Research Design'],
        location: 'San Francisco, CA',
        avatarColor: 'bg-indigo-500',
        linkedInUrl: 'https://linkedin.com/in/sarahchen-neuro'
      },
      {
        id: 'p2',
        name: 'Marcus Thorne',
        email: 'marcus@sleep.org',
        role: UserRole.RESEARCHER,
        bio: 'Sleep hygiene researcher specializing in adolescent sleep patterns, screen time, and tech usage. PhD from Oxford. Runs the Sleep & Digital Health Lab. Looking for participants for longitudinal studies (2–4 weeks) and one-off surveys. All studies are remote and compensated.',
        expertise: ['Sleep Science', 'Behavioral Science', 'Adolescent Health', 'Survey Design'],
        location: 'London, UK',
        avatarColor: 'bg-emerald-500'
      },
      {
        id: 'p3',
        name: 'Jordan Thompson',
        email: 'jordan@gmail.com',
        role: UserRole.SUBJECT,
        bio: 'Tech enthusiast and frequent beta tester for mobile and web applications. Completed 80+ studies on ReSearch in the last two years. Strong interest in UX research, gaming, and accessibility. Reliable and responsive; happy to do follow-up interviews.',
        expertise: ['Beta Testing', 'UX Research', 'Gaming', 'Mobile Apps', 'Surveys'],
        location: 'Austin, TX',
        avatarColor: 'bg-amber-500',
        linkedInUrl: 'https://linkedin.com/in/jordanthompson-ux'
      },
      {
        id: 'p4',
        name: 'Dr. Elena Vasquez',
        email: 'elena@med.uni.edu',
        role: UserRole.RESEARCHER,
        bio: 'Clinical researcher in cardiovascular health and wearable validation studies. MD-PhD, currently at Boston Medical Center. Studies focus on heart rate accuracy of consumer devices, diet, and long-term health outcomes. In-person and remote studies available.',
        expertise: ['Medical', 'Technology', 'Nutrition', 'Cardiovascular Health', 'Wearables'],
        location: 'Boston, MA',
        avatarColor: 'bg-rose-500'
      },
      {
        id: 'p5',
        name: 'Alex Kim',
        email: 'alex.kim@gmail.com',
        role: UserRole.SUBJECT,
        bio: 'Product tester and survey participant with a focus on tech, health, and consumer research. Background in data analysis; comfortable with longer surveys and diary studies. Completed 45+ studies. Prefer remote; open to in-person in Seattle area.',
        expertise: ['Product Testing', 'Surveys', 'Technology', 'Health', 'Data Literacy'],
        location: 'Seattle, WA',
        avatarColor: 'bg-sky-500',
        linkedInUrl: 'https://linkedin.com/in/alexkim-product'
      },
      {
        id: 'p6',
        name: 'Prof. James Liu',
        email: 'jliu@econ.edu',
        role: UserRole.RESEARCHER,
        bio: 'Behavioral economist studying savings behavior, crypto adoption, and financial decision-making. Tenured at University of Chicago. Runs lab and online experiments; often needs large samples for survey-based studies. Compensation via gift cards or direct pay.',
        expertise: ['Economics', 'Behavioral Science', 'Finance', 'Survey Methods', 'Experiments'],
        location: 'Chicago, IL',
        avatarColor: 'bg-violet-500'
      },
      {
        id: 'p7',
        name: 'Maya Patel',
        email: 'maya.patel@outlook.com',
        role: UserRole.SUBJECT,
        bio: 'Psychology and wellness research participant with a background in mindfulness and mental health surveys. Completed 60+ studies including multi-week interventions and one-on-one interviews. Interested in clinical trials, wellness apps, and survey research.',
        expertise: ['Psychology', 'Surveys', 'Medical', 'Mindfulness', 'Mental Health'],
        location: 'Denver, CO',
        avatarColor: 'bg-teal-500',
        linkedInUrl: 'https://linkedin.com/in/mayapatel-wellness'
      },
      {
        id: 'p8',
        name: 'Dr. Rachel Foster',
        email: 'rfoster@psych.edu',
        role: UserRole.RESEARCHER,
        bio: 'Stress and remote work researcher. Runs longitudinal surveys and qualitative interview studies. PhD in Organizational Psychology. Currently recruiting for a 2-week diary study on work-life balance and a one-off survey on hybrid work preferences.',
        expertise: ['Psychology', 'Behavioral Science', 'Remote Work', 'Stress', 'Qualitative Methods'],
        location: 'Toronto, Canada',
        avatarColor: 'bg-fuchsia-500'
      },
      {
        id: 'p9',
        name: 'David Okonkwo',
        email: 'david.o@email.com',
        role: UserRole.SUBJECT,
        bio: 'Beta tester for games and productivity apps. Enjoys UX and usability studies; comfortable with screen recording and think-aloud protocols. Completed 30+ studies. Fast turnaround on surveys; available for multi-session studies.',
        expertise: ['Product Testing', 'Technology', 'Gaming', 'UX Research', 'Usability'],
        location: 'Atlanta, GA',
        avatarColor: 'bg-orange-500'
      },
      {
        id: 'p10',
        name: 'Dr. Nina Kowalski',
        email: 'nina.k@neuro.institute',
        role: UserRole.RESEARCHER,
        bio: 'Cognitive neuroscientist at Berlin Institute. Studies attention, memory, and digital interventions. Uses online tasks and surveys; some studies require a quiet environment and a laptop. Compensation in EUR or USD. Always looking for international participants.',
        expertise: ['Neuroscience', 'Psychology', 'Technology', 'Attention', 'Memory'],
        location: 'Berlin, Germany',
        avatarColor: 'bg-cyan-500'
      },
      {
        id: 'p11',
        name: 'Sofia Garcia',
        email: 'sofia.g@gmail.com',
        role: UserRole.SUBJECT,
        bio: 'Frequent survey taker and occasional product tester. Focus on lifestyle, nutrition, and health studies. Completed 50+ studies. Prefer surveys under 30 minutes; open to longer studies with good compensation. Bilingual (English/Spanish) for relevant studies.',
        expertise: ['Surveys', 'Nutrition', 'Psychology', 'Lifestyle', 'Health'],
        location: 'Miami, FL',
        avatarColor: 'bg-pink-500',
        linkedInUrl: 'https://linkedin.com/in/sofiagarcia-health'
      },
      {
        id: 'p12',
        name: 'Dr. Kenji Tanaka',
        email: 'ktanaka@nutritionlab.org',
        role: UserRole.RESEARCHER,
        bio: 'Nutrition scientist studying diet patterns, energy levels, and plant-based eating. Runs short surveys and optional 1-week food diaries. Studies are fully remote; compensation via PayPal or gift cards. Often recruiting 200+ participants per study.',
        expertise: ['Nutrition', 'Medical', 'Surveys', 'Diet', 'Plant-Based'],
        location: 'Los Angeles, CA',
        avatarColor: 'bg-lime-500'
      },
      {
        id: 'p13',
        name: 'Chris Morgan',
        email: 'chris.morgan@work.com',
        role: UserRole.SUBJECT,
        bio: 'Remote worker and research participant. Interested in productivity, stress, and tech studies. Completed 35+ studies; comfortable with weekly check-ins and longer surveys. Based in Portland; available for remote studies across time zones.',
        expertise: ['Surveys', 'Psychology', 'Technology', 'Productivity', 'Remote Work'],
        location: 'Portland, OR',
        avatarColor: 'bg-slate-600'
      },
      {
        id: 'p14',
        name: 'Dr. Aisha Okeke',
        email: 'a.okeke@decisionlab.uk',
        role: UserRole.RESEARCHER,
        bio: 'Decision-making and behavioral science researcher. Runs lab and online experiments; studies typically 30–60 minutes. Topics include risk, time preferences, and framing effects. Recruiting UK and international participants. Compensation in GBP or USD.',
        expertise: ['Behavioral Science', 'Economics', 'Psychology', 'Decision-Making', 'Experiments'],
        location: 'London, UK',
        avatarColor: 'bg-amber-600'
      },
      {
        id: 'p15',
        name: 'Taylor Reed',
        email: 'taylor.reed@email.com',
        role: UserRole.SUBJECT,
        bio: 'Diverse research participant: medical trials, surveys, and product tests. Completed 90+ studies. Comfortable with clinical terminology and longer commitments. Interested in healthcare, wearables, and consumer research. Phoenix-based; open to in-person when needed.',
        expertise: ['Medical', 'Surveys', 'Product Testing', 'Healthcare', 'Clinical'],
        location: 'Phoenix, AZ',
        avatarColor: 'bg-red-500',
        linkedInUrl: 'https://linkedin.com/in/taylorreed-research'
      }
    ];

    setStudies(mockStudies);
    setProfiles(mockProfiles);
    setCollaborations([
      { id: 'c1', researcherId: 'res-default', researcherName: 'Sarah Chen', field: 'Neuroscience', goal: 'Looking for a data scientist to analyze fMRI results.', status: 'ACTIVE' },
      { id: 'c2', researcherId: 'res-default', researcherName: 'Marcus Thorne', field: 'Sleep Science', goal: 'Seeking lab facility with polysomnography equipment.', status: 'ACTIVE' },
    ]);
    setDataAssets([
      {
        id: 'd1',
        title: 'Youth Sleep Survey Data (2023)',
        description: 'Raw survey responses from 2,000 high school students regarding sleep hygiene and digital device usage.',
        field: 'Sleep Science',
        format: 'CSV / Excel',
        recordCount: 2000,
        ownerId: 'res-default',
        ownerName: 'Marcus Thorne',
        createdAt: new Date().toISOString()
      }
    ]);
  }, []);

  // Load studies from Supabase when configured (overwrites mock studies)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchStudies().then((data) => {
      if (data.length >= 0) setStudies(data);
    });
  }, []);

  // Upsert researcher (with ENS when resolved) or participant on mount
  useEffect(() => {
    if (!address) return;
    if (mode === 'researcher') {
      getOrCreateResearcher(address, ensName ?? null).then(setResearcherId);
    } else {
      ensureParticipant(address);
    }
  }, [address, mode, ensName]);

  // Sync participant tab with route
  useEffect(() => {
    if (mode === 'participant') setActiveTab(participantTab === 'my-dashboard' ? 'my-dashboard' : 'trending');
  }, [mode, participantTab]);

  // Load My Dashboard data when tab is selected (researcher: dashboard or my-dashboard; participant: my-dashboard only)
  useEffect(() => {
    if (!address) return;
    const researcherNeedsStudies = mode === 'researcher' && (activeTab === 'dashboard' || activeTab === 'my-dashboard');
    const participantNeedsEnrollments = mode === 'participant' && activeTab === 'my-dashboard';
    if (!researcherNeedsStudies && !participantNeedsEnrollments) return;
    setMyDashboardLoading(true);
    if (mode === 'researcher') {
      fetchResearcherStudies(address).then(setMyDashboardStudies).finally(() => setMyDashboardLoading(false));
    } else {
      fetchParticipantEnrollments(address).then(setMyDashboardEnrollments).finally(() => setMyDashboardLoading(false));
    }
  }, [activeTab, address, mode]);

  const filteredStudies = useMemo(() => {
    return studies.filter(study => {
      const matchesSearch = study.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            study.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || study.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [studies, searchQuery, selectedCategory]);

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      const matchesRole = profileRoleFilter === 'ALL' || p.role === profileRoleFilter;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRole && matchesSearch;
    });
  }, [profiles, profileRoleFilter, searchQuery]);

  const handleCreateStudy = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmittingStudy) return;
    setIsSubmittingStudy(true);
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const compensation = Number(formData.get('compensation'));
    const maxParticipants = Number(formData.get('max_participants')) || 100;

    try {
      if (isSupabaseConfigured()) {
        let ipfsCid: string | null = null;
        if (isIpfsConfigured()) {
          const metadata: StudyMetadata = {
            title,
            description: (formData.get('description') as string) || undefined,
            eligibility: (formData.get('eligibility') as string) || undefined,
            location: (formData.get('location') as string) || 'Remote/Global',
            category: (formData.get('category') as string) || undefined,
          };
          ipfsCid = await uploadStudyMetadata(metadata);
        }
        const result = await createStudy({
          title,
          rewardAmount: compensation,
          maxParticipants,
          researcherWallet: address,
          researcherEns: ensName ?? undefined,
          ipfsCid,
        });
        if (result) {
          const list = await fetchStudies();
          if (list.length) setStudies(list);
          setIsCreating(false);
          return;
        }
      }

      const newStudy: ResearchStudy = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        category: formData.get('category') as ResearchStudy['category'],
        description: formData.get('description') as string,
        eligibility: formData.get('eligibility') as string,
        location: (formData.get('location') as string) || 'Remote/Global',
        compensation,
      researcherId: researcherId || 'anon',
      researcherName: shortAddress(address),
        createdAt: new Date().toISOString(),
        participantCount: 0,
        status: 'OPEN',
      };
      setStudies([newStudy, ...studies]);
      setIsCreating(false);
    } finally {
      setIsSubmittingStudy(false);
    }
  };

  const handleRequestApply = async (study: ResearchStudy) => {
    if (isSupabaseConfigured() && !(await hasMinimalProfile(address))) {
      setPendingProfileAction({ type: 'apply', study });
      setShowProfileRequiredModal(true);
      setProfileForm({ displayName: '', linkedInUrl: '' });
      return;
    }
    setSelectedStudyForApplication(study);
  };

  const handleRequestCreateStudy = async () => {
    if (isSupabaseConfigured() && !(await hasMinimalProfile(address))) {
      setPendingProfileAction({ type: 'create-study' });
      setShowProfileRequiredModal(true);
      setProfileForm({ displayName: '', linkedInUrl: '' });
      return;
    }
    setIsCreating(true);
  };

  const handleSaveProfileAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile || !profileForm.displayName.trim()) return;
    setIsSavingProfile(true);
    try {
      const ok = await setProfile(address, {
        displayName: profileForm.displayName.trim(),
        linkedInUrl: profileForm.linkedInUrl.trim() || null,
      });
      if (ok && pendingProfileAction) {
        setShowProfileRequiredModal(false);
        if (pendingProfileAction.type === 'apply') {
          setSelectedStudyForApplication(pendingProfileAction.study);
        } else {
          setIsCreating(true);
        }
        setPendingProfileAction(null);
      } else if (!ok) {
        alert('Could not save profile. Please try again.');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleFundStudy = async (study: ResearchStudy) => {
    if (fundingStudyId || !study.id) return;
    setFundingStudyId(study.id);
    try {
      const totalBudget = study.compensation * (study.maxParticipants ?? 100);
      const { sessionId } = await createStudyFundingSession({
        researcherAddress: address,
        amountUsdc: totalBudget,
        studyId: study.id,
      });
      const ok = await setStudyFunding(study.id, address, sessionId, totalBudget);
      if (ok) {
        const list = await fetchResearcherStudies(address);
        setMyDashboardStudies(list);
      } else {
        alert('Could not save funding. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Funding failed. Please try again.');
    } finally {
      setFundingStudyId(null);
    }
  };

  const handleSettleStudy = async (study: ResearchStudy) => {
    if (settlingStudyId || !study.yellowSessionId) return;
    setSettlingStudyId(study.id);
    try {
      const { txHash } = await settleStudySession(study.yellowSessionId);
      const ok = await markEnrollmentsPaidForStudy(study.id, txHash);
      if (ok) {
        const list = await fetchResearcherStudies(address);
        setMyDashboardStudies(list);
      } else {
        alert('Could not update payouts. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Settlement failed. Please try again.');
    } finally {
      setSettlingStudyId(null);
    }
  };

  const handleMarkComplete = async (enrollmentId: string, study: ResearchStudy) => {
    if (completingEnrollmentId) return;
    setCompletingEnrollmentId(enrollmentId);
    try {
      if (study.yellowSessionId) {
        await creditParticipantInSession({
          sessionId: study.yellowSessionId,
          participantAddress: address,
          amountUsdc: study.compensation,
        });
      }
      const ok = await markEnrollmentCompleted(enrollmentId);
      if (ok) {
        const list = await fetchParticipantEnrollments(address);
        setMyDashboardEnrollments(list);
      } else {
        alert('Could not mark complete. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed. Please try again.');
    } finally {
      setCompletingEnrollmentId(null);
    }
  };

  const handleAIAssist = async () => {
    const topic = prompt("What is the topic of your research?");
    if (!topic) return;
    setIsLoadingAI(true);
    try {
      const result = await generateStudyContent(topic);
      const titleInput = document.getElementById('study-title') as HTMLInputElement;
      const descInput = document.getElementById('study-desc') as HTMLTextAreaElement;
      const eligInput = document.getElementById('study-elig') as HTMLInputElement;
      if (titleInput) titleInput.value = result.title;
      if (descInput) descInput.value = result.description;
      if (eligInput) eligInput.value = result.eligibility;
    } catch (error) { console.error("AI Error:", error); } 
    finally { setIsLoadingAI(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg font-bold">R</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">ReSearch</span>
            </Link>
            <div className="flex gap-4">
              {mode === 'researcher' ? (
                <>
                  <button onClick={() => setActiveTab('dashboard')} className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Home</button>
                  <button onClick={() => setActiveTab('my-dashboard')} className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${activeTab === 'my-dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Dashboard</button>
                  <button onClick={() => setActiveTab('collaborate')} className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${activeTab === 'collaborate' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Collaborations</button>
                  <button onClick={() => setActiveTab('data-exchange')} className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${activeTab === 'data-exchange' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Data Exchange</button>
                  <button onClick={() => setActiveTab('meet-people')} className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${activeTab === 'meet-people' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Meet People</button>
                </>
              ) : (
                <>
                  <Link to="/studies" className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${participantTab === 'studies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Studies</Link>
                  <Link to="/participant/dashboard" className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${participantTab === 'my-dashboard' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Dashboard</Link>
                  <button onClick={() => setActiveTab('meet-people')} className={`text-sm font-semibold px-2 py-4 border-b-2 transition-all ${activeTab === 'meet-people' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Meet People</button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-mono text-slate-600 hidden sm:inline">{shortAddress(address)}</span>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className={activeTab === 'trending' || activeTab === 'my-dashboard' ? 'min-h-screen' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {activeTab === 'my-dashboard' ? (
          <div className="min-h-screen bg-[#0f172a] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-2xl sm:text-3xl font-black mb-2">
                {mode === 'researcher' ? 'My research' : 'Studies I joined'}
              </h1>
              <p className="text-slate-400 text-sm mb-8">
                {mode === 'researcher'
                  ? 'Studies you created and their status.'
                  : 'Studies you have applied to or completed.'}
              </p>
              {myDashboardLoading ? (
                <div className="animate-pulse space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 h-[88px]" />
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-white/10 rounded w-3/4 max-w-xs" />
                          <div className="h-4 bg-white/10 rounded w-full max-w-md" />
                          <div className="flex gap-3 mt-3">
                            <div className="h-6 bg-white/10 rounded w-16" />
                            <div className="h-6 bg-white/10 rounded w-24" />
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <div className="h-9 bg-white/10 rounded-lg w-24" />
                          <div className="h-9 bg-white/10 rounded-lg w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : mode === 'researcher' ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-indigo-300">{myDashboardStudies.length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Studies posted</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-emerald-400">{myDashboardStudies.filter(s => s.status === 'OPEN').length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Open</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-amber-400">{myDashboardStudies.reduce((a, s) => a + s.participantCount, 0)}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Total participants</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-violet-400">${myDashboardStudies.reduce((a, s) => a + s.compensation * s.participantCount, 0)}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Est. rewards</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {myDashboardStudies.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-slate-400">
                        No studies yet. Create one from Home → Launch New Project.
                      </div>
                    ) : (
                      myDashboardStudies.map((study) => (
                        <div key={study.id} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-white truncate">{study.title}</h3>
                            <p className="text-slate-400 text-sm mt-1">{study.description || 'No description'}</p>
                            <div className="flex flex-wrap gap-3 mt-3 text-xs">
                              <span className="px-2 py-1 rounded bg-white/10 text-slate-300">{study.status}</span>
                              <span className="text-slate-500">{study.participantCount} participants</span>
                              <span className="text-emerald-400">${study.compensation} each</span>
                              {study.yellowSessionId && study.fundedAmount != null && (
                                <span className="text-emerald-300">Funded ${study.fundedAmount}</span>
                              )}
                              <span className="text-slate-500">{new Date(study.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 flex-shrink-0">
                            {!study.yellowSessionId ? (
                              <button type="button" disabled={!!fundingStudyId} onClick={() => setStudyToFund(study)} className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-sm font-semibold disabled:opacity-50">{(fundingStudyId === study.id ? 'Funding…' : 'Fund Study')}</button>
                            ) : (
                              <button type="button" disabled={!!settlingStudyId} onClick={() => setStudyToSettle(study)} className="px-4 py-2 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-sm font-semibold disabled:opacity-50">{(settlingStudyId === study.id ? 'Settling…' : 'Settle Payouts')}</button>
                            )}
                            <button type="button" onClick={() => setStudyToEdit(study)} className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-semibold">Edit</button>
                            <button type="button" onClick={() => setStudyToDelete(study)} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 text-sm font-semibold">Delete</button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-indigo-300">{myDashboardEnrollments.length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Studies joined</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-amber-400">{myDashboardEnrollments.filter(e => e.status === 'joined').length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">In progress</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-emerald-400">{myDashboardEnrollments.filter(e => e.status === 'completed').length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Completed</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="text-2xl font-bold text-violet-400">{myDashboardEnrollments.filter(e => e.status === 'paid').length}</div>
                      <div className="text-xs text-slate-400 uppercase tracking-wider">Paid</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {myDashboardEnrollments.length === 0 ? (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center text-slate-400">
                        You haven&apos;t joined any studies yet. Go to Trending or Home to apply.
                      </div>
                    ) : (
                      myDashboardEnrollments.map((e) => (
                        <div key={e.enrollmentId} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-white truncate">{e.study.title}</h3>
                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{e.study.description || 'No description'}</p>
                            <div className="flex flex-wrap gap-3 mt-3 text-xs">
                              <span className={`px-2 py-1 rounded ${e.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : e.status === 'completed' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-slate-300'}`}>{e.status}</span>
                              <span className="text-emerald-400">${e.study.compensation}</span>
                              <span className="text-slate-500">Joined {new Date(e.joinedAt).toLocaleDateString()}</span>
                              {e.completedAt && <span className="text-slate-500">Completed {new Date(e.completedAt).toLocaleDateString()}</span>}
                              {e.payoutTxHash && <span className="text-violet-400">Paid ✓</span>}
                            </div>
                          </div>
                          {e.status === 'joined' && (
                            <button type="button" disabled={!!completingEnrollmentId} onClick={() => handleMarkComplete(e.enrollmentId, e.study)} className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-sm font-semibold disabled:opacity-50 flex-shrink-0">{(completingEnrollmentId === e.enrollmentId ? 'Updating…' : 'Mark complete')}</button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ) : activeTab === 'trending' ? (
          <div className="trending-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Stats row – same as ResearchFi participant dashboard */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                <div className="trending-stat-card" style={{ borderLeftColor: '#6366f1' }}>
                  <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#818cf8' }}>{filteredStudies.length}</div>
                  <div className="text-sm opacity-80">Opportunities</div>
                </div>
                <div className="trending-stat-card" style={{ borderLeftColor: '#22c55e' }}>
                  <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#4ade80' }}>{[...new Set(filteredStudies.map(s => s.category))].length}</div>
                  <div className="text-sm opacity-80">Categories</div>
                </div>
                <div className="trending-stat-card" style={{ borderLeftColor: '#a855f7' }}>
                  <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#c084fc' }}>
                    {filteredStudies.reduce((sum, s) => sum + s.participantCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-80">Total Spots</div>
                </div>
                <div className="trending-stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                  <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#fbbf24' }}>
                    ${(filteredStudies.reduce((sum, s) => sum + s.compensation * s.participantCount, 0) / 1000).toFixed(0)}k+
                  </div>
                  <div className="text-sm opacity-80">Est. Rewards</div>
                </div>
              </div>

              {/* Available Opportunities – heading + search + category */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Available Opportunities</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                      type="text"
                      placeholder="Search studies..."
                      className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-indigo-500/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2.5 rounded-lg bg-white/5 border border-indigo-500/20 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opportunity cards – ResearchFi-style list */}
              <div className="space-y-5">
                {filteredStudies.length > 0 ? (
                  filteredStudies.map(study => (
                    <div key={study.id} className="trending-opportunity-card flex flex-col sm:flex-row sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 sm:gap-3 items-start mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl flex-shrink-0 bg-indigo-500/20 text-indigo-300">
                            {study.category === 'Surveys' ? '📋' : study.category === 'Product Testing' ? '📱' : '🔬'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-white mb-2">{study.title}</h3>
                            <div className="flex flex-wrap gap-2">
                              <span className="trending-tag">{study.category}</span>
                              <span className="trending-tag">{study.location.replace(/\/.*$/, '').trim() || 'Remote'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-xs opacity-60 mb-0.5">Type</div>
                            <div className="font-medium text-slate-200">{study.category}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-60 mb-0.5">Location</div>
                            <div className="font-medium text-slate-200 line-clamp-1">{study.location}</div>
                          </div>
                          <div>
                            <div className="text-xs opacity-60 mb-0.5">Spots</div>
                            <div className="font-medium text-slate-200">0 / {study.participantCount}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-stretch sm:items-end justify-between gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">${study.compensation}</div>
                          <div className="text-xs opacity-70">+ Reputation</div>
                        </div>
                        <button
                          type="button"
                          className="trending-btn-apply"
                          onClick={() => handleRequestApply(study)}
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="trending-opportunity-card text-center py-12">
                    <p className="text-slate-400 mb-4">No opportunities match your filters.</p>
                    <button
                      type="button"
                      className="trending-btn-apply"
                      onClick={() => { setSearchQuery(''); setSelectedCategory('All Categories'); }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'meet-people' ? (
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Research Community</h2>
                <p className="text-slate-500">Discover and connect with experts and participants.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search profiles..." 
                    className="w-full sm:w-64 pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-700"
                  value={profileRoleFilter}
                  onChange={(e) => setProfileRoleFilter(e.target.value as any)}
                >
                  <option value="ALL">All Roles</option>
                  <option value={UserRole.RESEARCHER}>Researchers</option>
                  <option value={UserRole.SUBJECT}>Subjects</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProfiles.map(profile => (
                <div key={profile.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`${profile.avatarColor} w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black`}>
                      {profile.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-black text-slate-900 leading-none">{profile.name}</h3>
                        {profile.linkedInUrl && (
                          <a href={profile.linkedInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2]/20 transition-colors" title="View LinkedIn profile" aria-label="LinkedIn profile">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          </a>
                        )}
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${profile.role === UserRole.RESEARCHER ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                        {profile.role}
                      </span>
                      <p className="text-xs text-slate-400 mt-1 font-medium">{profile.location}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed flex-grow">{profile.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {profile.expertise?.map(tag => (
                      <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button type="button" onClick={() => setViewProfileUser(profile)} className="w-full py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    View Full Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'collaborate' ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Research Collaborations</h2>
                <p className="text-slate-500">Find peers for cross-disciplinary projects.</p>
              </div>
              <button onClick={() => alert("Post Collaboration feature coming soon!")} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg">+ Post Request</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collaborations.map(collab => (
                <div key={collab.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg">{collab.field}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{collab.status}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Lead: {collab.researcherName}</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">{collab.goal}</p>
                  <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">Express Interest</button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'data-exchange' ? (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Data Asset Exchange</h2>
                <p className="text-slate-500">Share or acquire datasets for secondary analysis.</p>
              </div>
              <button onClick={() => alert("Dataset upload coming soon!")} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 shadow-lg">Upload Dataset</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {dataAssets.map(asset => (
                <div key={asset.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg">{asset.field}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{asset.format}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{asset.title}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">By {asset.ownerName}</p>
                  <p className="text-slate-600 mb-6 leading-relaxed">{asset.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{asset.recordCount.toLocaleString()} Records</span>
                    <button className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">Request Access</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          mode === 'participant' ? (
            <div>
              <div className="mb-8 bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-black mb-2">Available Opportunities</h2>
                <p className="text-slate-300">Filtered for: <span className="text-indigo-400 font-bold">{selectedCategory}</span></p>
              </div>

              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search opportunities..." 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-64">
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredStudies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStudies.map(study => (
                    <StudyCard 
                      key={study.id} 
                      study={study} 
                      showApplyButton 
                      onApply={(s) => handleRequestApply(s)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                  <p className="text-slate-500 text-lg">No opportunities found matching your criteria.</p>
                  <button onClick={() => {setSearchQuery(''); setSelectedCategory('All Categories');}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear all filters</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900">Your Study Dashboard</h2>
                  <p className="text-slate-500">Manage recruitment and research projects.</p>
                </div>
                <button onClick={handleRequestCreateStudy} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 shadow-xl">+ Launch New Project</button>
              </div>
              {myDashboardLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 h-64 flex flex-col gap-3">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-4 bg-slate-100 rounded w-1/4" />
                      <div className="h-3 bg-slate-100 rounded w-full flex-grow" />
                      <div className="h-9 bg-slate-100 rounded-lg w-full mt-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {myDashboardStudies.map(study => (
                    <div key={study.id} className="relative">
                      <StudyCard study={study} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </main>

      {showProfileRequiredModal && pendingProfileAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900">Create your profile</h3>
              <p className="text-slate-500 mt-1">
                {pendingProfileAction.type === 'apply'
                  ? 'A minimal profile is required to apply to studies.'
                  : 'A minimal profile is required to launch a study.'}
              </p>
            </div>
            <form onSubmit={handleSaveProfileAndContinue} className="p-8 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Display name (required)</label>
                <input
                  type="text"
                  value={profileForm.displayName}
                  onChange={(e) => setProfileForm((f) => ({ ...f, displayName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="How you want to be shown to researchers"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">LinkedIn URL (optional)</label>
                <input
                  type="url"
                  value={profileForm.linkedInUrl}
                  onChange={(e) => setProfileForm((f) => ({ ...f, linkedInUrl: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowProfileRequiredModal(false); setPendingProfileAction(null); }}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isSavingProfile || !profileForm.displayName.trim()} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSavingProfile ? 'Saving…' : 'Save & continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudyForApplication && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900">Apply to Participate</h3>
              <p className="text-slate-500 truncate">{selectedStudyForApplication.title}</p>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const studyId = selectedStudyForApplication.id;
                if (isSupabaseConfigured()) {
                  const { ok, alreadyEnrolled } = await joinStudy(studyId, address);
                  setSelectedStudyForApplication(null);
                  if (ok) alert('Application sent! You have joined this study.');
                  else if (alreadyEnrolled) alert('You are already enrolled in this study.');
                  else alert('Could not join. Please try again.');
                  const list = await fetchStudies();
                  if (list.length) setStudies(list);
                  return;
                }
                setSelectedStudyForApplication(null);
                alert('Application sent!');
              }}
              className="p-8 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Wallet</label>
                <p className="text-slate-600 font-mono text-sm py-2">{shortAddress(address)}</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Relevant Background</label>
                <textarea rows={3} required className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Explain why you are a good fit..."></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setSelectedStudyForApplication(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col my-8 max-h-[90vh]">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-black text-slate-900">Launch New Project</h3>
              <button onClick={() => setIsCreating(false)} className="text-slate-400 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={handleCreateStudy} className="flex flex-col min-h-0 flex-1 flex">
              <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="flex justify-between items-center">
                  <button type="button" onClick={handleAIAssist} disabled={isLoadingAI} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                    {isLoadingAI ? 'Generating...' : '✨ AI Assist Content'}
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Project Title</label>
                  <input id="study-title" name="title" required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Compensation ($)</label>
                    <input name="compensation" type="number" required min={0} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Max participants</label>
                    <input name="max_participants" type="number" required min={1} defaultValue={100} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Category (for display)</label>
                  <select name="category" required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none">
                    {categories.filter(c => c !== 'All Categories').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Eligibility Criteria</label>
                  <input id="study-elig" name="eligibility" required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea id="study-desc" name="description" rows={4} required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none" />
                </div>
                <input name="location" type="hidden" value="Remote/Global" />
              </div>
              <div className="p-6 border-t bg-white flex gap-4 flex-shrink-0">
                <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isSubmittingStudy} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl cursor-pointer hover:bg-slate-800 active:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{(isSubmittingStudy ? 'Publishing…' : 'Publish Listing')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studyToEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative z-10 flex flex-col my-8 max-h-[90vh]">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center flex-shrink-0">
              <h3 className="text-xl font-black text-slate-900">Edit study</h3>
              <button type="button" onClick={() => setStudyToEdit(null)} className="text-slate-400 text-2xl leading-none">×</button>
            </div>
            <form
              key={studyToEdit.id}
              onSubmit={async (e) => {
                e.preventDefault();
                if (isUpdatingStudy) return;
                setIsUpdatingStudy(true);
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                const rewardAmount = Number(formData.get('compensation'));
                const maxParticipants = Number(formData.get('max_participants')) || 100;
                const status = (formData.get('status') as string) === 'closed' ? 'closed' : 'open';
                try {
                  const ok = await updateStudy(
                    studyToEdit.id,
                    {
                      title,
                      rewardAmount,
                      maxParticipants,
                      status,
                      metadata: {
                        title,
                        description: (formData.get('description') as string) || undefined,
                        eligibility: (formData.get('eligibility') as string) || undefined,
                        location: (formData.get('location') as string) || 'Remote/Global',
                        category: (formData.get('category') as string) || undefined,
                      },
                    },
                    address
                  );
                  if (ok) {
                    const list = await fetchStudies();
                    if (list.length) setStudies(list);
                    const myList = await fetchResearcherStudies(address);
                    setMyDashboardStudies(myList);
                    setStudyToEdit(null);
                  } else {
                    alert('Could not update study. Please try again.');
                  }
                } finally {
                  setIsUpdatingStudy(false);
                }
              }}
              className="flex flex-col min-h-0 flex-1 flex"
            >
              <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div>
                  <label className="block text-sm font-bold mb-1">Project Title</label>
                  <input name="title" defaultValue={studyToEdit.title} required className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Compensation ($)</label>
                    <input name="compensation" type="number" defaultValue={studyToEdit.compensation} required min={0} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Max participants</label>
                    <input name="max_participants" type="number" defaultValue={studyToEdit.maxParticipants ?? 100} required min={1} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Status</label>
                  <select name="status" defaultValue={studyToEdit.status === 'CLOSED' ? 'closed' : 'open'} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none">
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Category (for display)</label>
                  <select name="category" required defaultValue={studyToEdit.category} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none">
                    {categories.filter(c => c !== 'All Categories').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Eligibility Criteria</label>
                  <input name="eligibility" defaultValue={studyToEdit.eligibility} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea name="description" rows={4} defaultValue={studyToEdit.description} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none resize-none" />
                </div>
                <input name="location" type="hidden" value="Remote/Global" />
              </div>
              <div className="p-6 border-t bg-white flex gap-4 flex-shrink-0">
                <button type="button" onClick={() => setStudyToEdit(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold">Cancel</button>
                <button type="submit" disabled={isUpdatingStudy} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl disabled:opacity-50">{(isUpdatingStudy ? 'Saving…' : 'Save changes')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {studyToFund && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">Fund study</h3>
            <p className="text-slate-600 text-sm mb-4">
              You are about to fund <strong>&quot;{studyToFund.title}&quot;</strong> via Yellow Network.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Compensation per participant</span>
                <span className="font-bold text-slate-900">${studyToFund.compensation}</span>
              </div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Max participants</span>
                <span className="font-bold text-slate-900">{studyToFund.maxParticipants ?? 100}</span>
              </div>
              <div className="flex justify-between text-slate-700 mt-2 pt-2 border-t border-slate-200">
                <span className="font-bold">Total budget</span>
                <span className="font-black text-emerald-600">${studyToFund.compensation * (studyToFund.maxParticipants ?? 100)}</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              This creates a Yellow funding session and records the funded amount. Participants can be paid out after you complete the study and settle.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStudyToFund(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  const study = studyToFund;
                  setStudyToFund(null);
                  if (study) await handleFundStudy(study);
                }}
                disabled={!!fundingStudyId}
                className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                Fund study
              </button>
            </div>
          </div>
        </div>
      )}

      {studyToSettle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">Settle payouts</h3>
            <p className="text-slate-600 text-sm mb-4">
              Finalize payments for <strong>&quot;{studyToSettle.title}&quot;</strong>.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Participants to pay</span>
                <span className="font-bold text-slate-900">{studyToSettle.participantCount}</span>
              </div>
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Amount per participant</span>
                <span className="font-bold text-slate-900">${studyToSettle.compensation}</span>
              </div>
              <div className="flex justify-between text-slate-700 mt-2 pt-2 border-t border-slate-200">
                <span className="font-bold">Total payout</span>
                <span className="font-black text-violet-600">${studyToSettle.participantCount * studyToSettle.compensation}</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mb-6">
              This settles the Yellow session and records the payout transaction. Make sure you have marked participants as completed before settling.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStudyToSettle(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  const study = studyToSettle;
                  setStudyToSettle(null);
                  if (study) await handleSettleStudy(study);
                }}
                disabled={!!settlingStudyId}
                className="flex-1 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50"
              >
                Settle payouts
              </button>
            </div>
          </div>
        </div>
      )}

      {studyToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 p-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">Delete study?</h3>
            <p className="text-slate-600 text-sm mb-6">
              &quot;{studyToDelete.title}&quot; will be permanently deleted. All enrollments for this study will also be removed. This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button type="button" onClick={() => setStudyToDelete(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
              <button
                type="button"
                onClick={async () => {
                  const id = studyToDelete.id;
                  setStudyToDelete(null);
                  const ok = await deleteStudy(id, address);
                  if (ok) {
                    const list = await fetchStudies();
                    if (list.length) setStudies(list);
                    const myList = await fetchResearcherStudies(address);
                    setMyDashboardStudies(myList);
                  } else {
                    alert('Could not delete study. Please try again.');
                  }
                }}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {viewProfileUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start flex-shrink-0">
              <h3 className="text-xl font-black text-slate-900">Full profile</h3>
              <button type="button" onClick={() => setViewProfileUser(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-4">
                <div className={`${viewProfileUser.avatarColor ?? 'bg-slate-400'} w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black flex-shrink-0`}>
                  {viewProfileUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{viewProfileUser.name}</h4>
                  <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${viewProfileUser.role === UserRole.RESEARCHER ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    {viewProfileUser.role}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-slate-700 font-medium">{viewProfileUser.email}</p>
              </div>
              {viewProfileUser.location && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-slate-700 font-medium">{viewProfileUser.location}</p>
                </div>
              )}
              {viewProfileUser.bio && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">About</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{viewProfileUser.bio}</p>
                </div>
              )}
              {viewProfileUser.expertise && viewProfileUser.expertise.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Expertise & interests</p>
                  <div className="flex flex-wrap gap-2">
                    {viewProfileUser.expertise.map(tag => (
                      <span key={tag} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {viewProfileUser.linkedInUrl && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn</p>
                  <a href={viewProfileUser.linkedInUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#0A66C2] font-semibold text-sm hover:underline break-all">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A66C2]/10 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </span>
                    View LinkedIn profile
                  </a>
                </div>
              )}
              <div className="pt-2">
                <button type="button" onClick={() => setViewProfileUser(null)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
