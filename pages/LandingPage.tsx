import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { fetchStudies } from '../lib/studyService';

export function LandingPage() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [studiesCount, setStudiesCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [spotsCount, setSpotsCount] = useState(0);
  const [rewardsEst, setRewardsEst] = useState('0');

  useEffect(() => {
    fetchStudies().then((data) => {
      setStudiesCount(data.length);
      setCategoriesCount([...new Set(data.map((s) => s.category))].length);
      setSpotsCount(data.reduce((sum, s) => sum + s.participantCount, 0));
      setRewardsEst((data.reduce((sum, s) => sum + s.compensation * s.participantCount, 0) / 1000).toFixed(0));
    });
  }, []);

  useEffect(() => {
    if (address && pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
    }
  }, [address, pendingRoute, navigate]);

  const handleLaunchResearchLab = () => {
    setPendingRoute('/researcher/dashboard');
    openConnectModal?.();
  };

  const handleJoinAsSubject = () => {
    setPendingRoute('/studies');
    openConnectModal?.();
  };

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-[100] bg-white/90 backdrop-blur-xl border-b border-indigo-100/60 shadow-sm shadow-indigo-500/5">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 group-hover:scale-105 transition-all duration-300">R</div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase group-hover:text-indigo-600 transition-colors duration-300">ReSearch</span>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <button type="button" onClick={handleJoinAsSubject} className="nav-tab hidden md:flex items-center text-sm font-bold text-slate-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg px-4 py-2.5 transition-all duration-200 border border-indigo-100/80">Find a Study</button>
            <button type="button" onClick={handleJoinAsSubject} className="nav-tab hidden md:flex items-center text-sm font-bold text-slate-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg px-4 py-2.5 transition-all duration-200 border border-indigo-100/80">Trending</button>
            <button type="button" onClick={handleLaunchResearchLab} className="nav-tab hidden md:flex items-center text-sm font-bold text-slate-700 bg-indigo-50/90 hover:bg-indigo-100 hover:text-indigo-700 rounded-lg px-4 py-2.5 transition-all duration-200 border border-indigo-100/80">Post Research</button>
            <ConnectButton.Custom>
              {({ openConnectModal: open }) => (
                <button
                  type="button"
                  onClick={() => {
                    setPendingRoute('/studies');
                    open();
                  }}
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-7 py-2.5 rounded-full text-sm font-black shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 animate-gradient-border border-2 border-indigo-400/50"
                >
                  Get Started
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
      </nav>

      <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden animate-gradient-bg" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e1b4b 75%, #0f172a 100%)', backgroundSize: '200% 200%' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-72 h-72 rounded-full bg-indigo-500/20 blur-[100px] animate-float animate-glow-pulse" />
          <div className="absolute bottom-[15%] right-[15%] w-96 h-96 rounded-full bg-amber-500/15 blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[50%] right-[25%] w-48 h-48 rounded-full bg-violet-400/15 blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
        </div>
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-20 pb-16 px-6">
          <div className="lg:col-span-7">
            <h1 className="landing-hero-title animate-fade-in-up animate-fade-in-up-2 text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl text-white mb-6 leading-[1.02] tracking-tight">
              Build the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-300 to-amber-300 bg-[length:200%_auto] animate-gradient-bg">research</span>.
            </h1>
            <p className="animate-fade-in-up animate-fade-in-up-3 text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed max-w-xl font-medium">
              Connect visionaries with voices. Run studies, join trials, or share data—all in one place.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-fade-in-up-4">
              <button type="button" onClick={handleLaunchResearchLab} className="relative overflow-hidden px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:bg-indigo-50 border border-white/20">
                <span className="relative z-10">Launch Research Lab</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/30 to-transparent animate-shimmer" />
              </button>
              <button type="button" onClick={handleJoinAsSubject} className="px-10 py-4 bg-transparent text-white rounded-2xl font-black text-lg border-2 border-indigo-400/60 hover:border-indigo-300 hover:bg-indigo-500/10 transition-all duration-300 hover:scale-[1.02]">
                Join as Subject
              </button>
            </div>
            <p className="animate-fade-in-up mt-6 text-sm font-semibold text-slate-400 tracking-wide">
              Research payments powered by <span className="yellow-network-text text-lg font-bold text-amber-300">Yellow Network</span>
            </p>
          </div>
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="animate-fade-in-up animate-fade-in-up-6 w-full max-w-lg aspect-[4/3] rounded-[3.5rem] overflow-hidden flex items-center justify-center p-10 border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
              <div className="relative w-full h-full flex flex-col justify-center gap-4">
                <div className="w-44 h-12 bg-white/10 rounded-xl self-start p-4 flex items-center gap-3 border border-white/10 animate-float">
                  <div className="w-4 h-4 bg-indigo-400 rounded-full animate-pulse" />
                  <div className="h-2 w-24 bg-white/20 rounded" />
                </div>
                <div className="w-56 h-28 bg-gradient-to-br from-indigo-500/40 to-violet-500/40 rounded-2xl self-center p-5 flex flex-col justify-between border border-indigo-400/30 shadow-lg shadow-indigo-500/20">
                  <div className="h-3 w-12 bg-white/30 rounded" />
                  <div className="h-4 w-36 bg-white/20 rounded" />
                  <div className="h-2 w-24 bg-white/40 rounded self-end" />
                </div>
                <div className="w-44 h-12 bg-white/10 rounded-xl self-end p-4 flex items-center gap-3 border border-white/10 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="w-4 h-4 bg-amber-400 rounded-full" />
                  <div className="h-2 w-24 bg-white/20 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white border-t border-indigo-100/50 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-64 h-64 rounded-full bg-indigo-200/20 blur-[80px] animate-float" />
          <div className="absolute bottom-1/4 right-0 w-72 h-72 rounded-full bg-violet-200/15 blur-[90px] animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="landing-stat-card bg-white rounded-2xl border-2 border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 mb-1">{studiesCount}</div>
              <div className="text-sm font-semibold text-slate-500">Opportunities</div>
            </div>
            <div className="landing-stat-card landing-stat-delay-1 bg-white rounded-2xl border-2 border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 mb-1">{categoriesCount}</div>
              <div className="text-sm font-semibold text-slate-500">Categories</div>
            </div>
            <div className="landing-stat-card landing-stat-delay-2 bg-white rounded-2xl border-2 border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-violet-600 mb-1">{spotsCount.toLocaleString()}</div>
              <div className="text-sm font-semibold text-slate-500">Total Spots</div>
            </div>
            <div className="landing-stat-card landing-stat-delay-3 bg-white rounded-2xl border-2 border-slate-100 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-amber-200 hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-black text-amber-600 mb-1">${rewardsEst}k+</div>
              <div className="text-sm font-semibold text-slate-500">Est. Rewards</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/20 border-t border-indigo-100/50 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-amber-100/25 blur-[100px] animate-float" style={{ animationDelay: '1s' }} />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <h2 className="landing-vertical-title text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter landing-hero-title">Choose Your Vertical</h2>
            <div className="landing-vertical-line w-24 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-amber-500 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <button type="button" onClick={handleLaunchResearchLab} className="animate-pillar-in pillar-delay-1 group bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer hover:-translate-y-3 transition-all duration-300 flex flex-col h-full text-left">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:from-indigo-500 group-hover:to-violet-600 group-hover:text-white transition-all duration-300 shadow-inner">🔬</div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Research Labs</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">Advanced workspace for academic and medical leads to post trials and manage subjects.</p>
              <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                Enterprise Lab <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
            <button type="button" onClick={() => { setPendingRoute('/studies'); openConnectModal?.(); }} className="animate-pillar-in pillar-delay-2 group bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer hover:-translate-y-3 transition-all duration-300 flex flex-col h-full text-left">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-inner">📱</div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Product Testing</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">Beta test the world&apos;s upcoming tech, industrial appliances, and next-gen gaming hardware.</p>
              <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                Start Testing <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
            <button type="button" onClick={handleJoinAsSubject} className="animate-pillar-in pillar-delay-3 group bg-white p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-violet-400 hover:shadow-xl hover:shadow-violet-500/10 cursor-pointer hover:-translate-y-3 transition-all duration-300 flex flex-col h-full text-left">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:bg-violet-500 group-hover:text-white transition-all duration-300 shadow-inner">📋</div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Surveys</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 flex-grow">Rapid consumer feedback loops for market trends, lifestyle audits, and quick opinion polls.</p>
              <div className="flex items-center gap-2 text-violet-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                Take Survey <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-32 px-6 bg-gradient-to-b from-indigo-50/30 via-white to-slate-50/50 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-violet-100/20 blur-[120px] animate-float pointer-events-none" style={{ animationDelay: '0.5s' }} />
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <div className="landing-feature-card animate-fade-in-up feature-delay-1">
            <div className="text-slate-900 font-black text-lg mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-indigo-500/25">01</span>
              Intelligent Matching
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Our AI matching engine ensures researchers find the exact eligibility criteria they need while saving subjects time.</p>
          </div>
          <div className="landing-feature-card animate-fade-in-up feature-delay-2">
            <div className="text-slate-900 font-black text-lg mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-violet-500/25">02</span>
              Secure Exchange
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Anonymized data exchange portal allows for seamless, ethical sharing of research assets across institutions.</p>
          </div>
          <div className="landing-feature-card animate-fade-in-up feature-delay-3">
            <div className="text-slate-900 font-black text-lg mb-4 flex items-center gap-3">
              <span className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-amber-500/25">03</span>
              Global Community
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">Connect with the best minds in neuroscience, product design, and behavioral science in one unified network.</p>
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-indigo-100/70 bg-gradient-to-b from-slate-50 to-slate-100/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-black shadow shadow-indigo-500/20">R</div>
            <span className="font-black text-slate-900 uppercase tracking-tighter">ReSearch Connect</span>
          </div>
          <div className="flex gap-10 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Ethics</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Lab Support</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">API</a>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2025 Platform Alpha. Global Operations.</p>
        </div>
      </footer>
    </div>
  );
}
