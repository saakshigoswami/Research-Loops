import React, { useState } from 'react';
import { Wallet, Users, FlaskConical, Handshake, Search, Bell, TrendingUp, Shield, Coins, CheckCircle, Clock, FileText, Award, Star, MapPin, Link2, MessageCircle, UserPlus, Filter } from 'lucide-react';

export default function ResearchFiApp() {
  const [activeTab, setActiveTab] = useState('participant');
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <div style={{ 
      fontFamily: "'Space Mono', monospace",
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f4c5c 100%)',
      minHeight: '100vh',
      color: '#e8f4f8',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.03,
        background: `
          radial-gradient(circle at 20% 30%, #00d9ff 0%, transparent 40%),
          radial-gradient(circle at 80% 70%, #7b2cbf 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, #00f5d4 0%, transparent 50%)
        `,
        animation: 'pulse 8s ease-in-out infinite'
      }} />
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=JetBrains+Mono:wght@300;500;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 0.03; transform: scale(1); }
          50% { opacity: 0.06; transform: scale(1.05); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.6); }
        }
        
        .card {
          background: rgba(26, 31, 58, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card:hover {
          border-color: rgba(0, 217, 255, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 217, 255, 0.2);
        }
        
        .btn {
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #00d9ff, #7b2cbf);
          color: white;
        }
        
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 217, 255, 0.4);
        }
        
        .btn-secondary {
          background: rgba(0, 217, 255, 0.1);
          color: #00d9ff;
          border: 1px solid #00d9ff;
        }
        
        .btn-secondary:hover {
          background: rgba(0, 217, 255, 0.2);
        }
        
        .tab {
          padding: 12px 24px;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          font-weight: 500;
          transition: all 0.3s ease;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .tab:hover {
          border-bottom-color: rgba(0, 217, 255, 0.5);
        }
        
        .tab.active {
          border-bottom-color: #00d9ff;
          color: #00d9ff;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(123, 44, 191, 0.1));
          border-left: 4px solid #00d9ff;
          padding: 20px;
          border-radius: 8px;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .badge-active {
          background: rgba(0, 245, 212, 0.2);
          color: #00f5d4;
          border: 1px solid #00f5d4;
        }
        
        .badge-pending {
          background: rgba(255, 183, 77, 0.2);
          color: #ffb74d;
          border: 1px solid #ffb74d;
        }
        
        .badge-completed {
          background: rgba(0, 217, 255, 0.2);
          color: #00d9ff;
          border: 1px solid #00d9ff;
        }
      `}</style>

      {/* Header */}
      <header style={{
        padding: '20px 40px',
        borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
        background: 'rgba(10, 14, 39, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #00d9ff, #7b2cbf)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'glow 3s ease-in-out infinite'
            }}>
              <FlaskConical size={24} />
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700',
              background: 'linear-gradient(135deg, #00d9ff, #7b2cbf)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px'
            }}>
              ResearchFi
            </h1>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} />
              <div style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: '8px',
                height: '8px',
                background: '#ff006e',
                borderRadius: '50%'
              }} />
            </div>
            
            {!walletConnected ? (
              <button 
                className="btn btn-primary"
                onClick={() => setWalletConnected(true)}
              >
                <Wallet size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Connect Wallet
              </button>
            ) : (
              <div style={{
                background: 'rgba(0, 217, 255, 0.1)',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #00d9ff',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Wallet size={16} />
                <span style={{ color: '#00f5d4', fontWeight: '700' }}>alice.eth</span>
                <span style={{ opacity: 0.6 }}>0x742d...3f9a</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0', 
          marginBottom: '40px',
          borderBottom: '1px solid rgba(0, 217, 255, 0.1)'
        }}>
          <div 
            className={`tab ${activeTab === 'participant' ? 'active' : ''}`}
            onClick={() => setActiveTab('participant')}
          >
            <Users size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Participant
          </div>
          <div 
            className={`tab ${activeTab === 'researcher' ? 'active' : ''}`}
            onClick={() => setActiveTab('researcher')}
          >
            <FlaskConical size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Researcher
          </div>
          <div 
            className={`tab ${activeTab === 'collaborate' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborate')}
          >
            <Handshake size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Collaborate
          </div>
          <div 
            className={`tab ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            <Users size={18} style={{ display: 'inline', marginRight: '8px' }} />
            Network
          </div>
        </div>

        {/* Participant View */}
        {activeTab === 'participant' && (
          <div style={{ animation: 'slideIn 0.5s ease-out' }}>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div className="stat-card">
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#00d9ff' }}>127</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Studies Completed</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#00f5d4' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#00f5d4' }}>4.9★</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Reputation Score</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#7b2cbf' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#7b2cbf' }}>$2,847</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Total Earned (USDC)</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#ffb74d' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffb74d' }}>3</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Active Studies</div>
              </div>
            </div>

            {/* Available Opportunities */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Available Opportunities</h2>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                  <input 
                    type="text"
                    placeholder="Search studies..."
                    style={{
                      background: 'rgba(0, 217, 255, 0.05)',
                      border: '1px solid rgba(0, 217, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 16px 10px 40px',
                      color: '#e8f4f8',
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '14px',
                      width: '300px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gap: '20px' }}>
                {[
                  {
                    title: 'AI Decision-Making Survey',
                    type: 'Survey',
                    reward: '$45',
                    rewardUnit: 'USDC',
                    duration: '15 min',
                    participants: '234/500',
                    tags: ['AI Ethics', 'Quick Pay'],
                    researcherEns: 'sarahchen.eth',
                    icon: <FileText size={24} />
                  },
                  {
                    title: 'Wearable Health Monitor Beta Testing',
                    type: 'Product Testing',
                    reward: '$320',
                    rewardUnit: 'USDC',
                    duration: '2 weeks',
                    participants: '12/30',
                    tags: ['Healthcare', 'Long-term'],
                    researcherEns: 'mitmedialab.eth',
                    icon: <Award size={24} />
                  },
                  {
                    title: 'Climate Change Perception Study',
                    type: 'Research',
                    reward: '$75',
                    rewardUnit: 'USDC',
                    duration: '45 min',
                    participants: '89/200',
                    tags: ['Environmental', 'Academic'],
                    researcherEns: 'stanford.eth',
                    icon: <FlaskConical size={24} />
                  }
                ].map((study, idx) => (
                  <div key={idx} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(123, 44, 191, 0.2))',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#00d9ff'
                          }}>
                            {study.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{study.title}</h3>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              {study.tags.map(tag => (
                                <span key={tag} style={{
                                  padding: '4px 10px',
                                  background: 'rgba(0, 217, 255, 0.1)',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  color: '#00d9ff'
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Type</div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{study.type}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Duration</div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>
                              <Clock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                              {study.duration}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Progress</div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{study.participants}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', marginLeft: '24px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '28px', fontWeight: '700', color: '#00f5d4' }}>{study.reward}</div>
                          <div style={{ fontSize: '12px', opacity: 0.6 }}>{study.rewardUnit} • + Reputation NFT</div>
                        {study.researcherEns && (
                          <div style={{ fontSize: '11px', color: '#00d9ff', marginTop: '4px' }}>Researcher: {study.researcherEns}</div>
                        )}
                        </div>
                        <button className="btn btn-primary">
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Studies */}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px' }}>Your Active Studies</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  { name: 'Memory Retention Study', progress: 65, status: 'In Progress', payout: '$120' },
                  { name: 'Nutrition Habits Survey', progress: 30, status: 'In Progress', payout: '$50' }
                ].map((study, idx) => (
                  <div key={idx} className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '600' }}>{study.name}</h4>
                        <span className="badge badge-active" style={{ marginTop: '8px' }}>{study.status}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#00f5d4' }}>{study.payout} USDC</div>
                        <div style={{ fontSize: '12px', opacity: 0.6 }}>Streaming (Yellow)</div>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                        <span>Progress</span>
                        <span>{study.progress}%</span>
                      </div>
                      <div style={{ 
                        height: '8px', 
                        background: 'rgba(0, 217, 255, 0.1)', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${study.progress}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #00d9ff, #00f5d4)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Researcher View */}
        {activeTab === 'researcher' && (
          <div style={{ animation: 'slideIn 0.5s ease-out' }}>
            {/* Research Dashboard Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <div className="stat-card">
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#00d9ff' }}>12</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Active Studies</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#00f5d4' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#00f5d4' }}>1,547</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Total Participants</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#7b2cbf' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#7b2cbf' }}>$42K</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Distributed (USDC)</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#ffb74d' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', color: '#ffb74d' }}>87%</div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>Completion Rate</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Your Studies</h2>
              <button className="btn btn-primary" title="Fund via LI.FI → USDC on Arc">
                + Create New Study • Fund with LI.FI
              </button>
            </div>

            {/* Studies Management */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {[
                {
                  title: 'Machine Learning Bias Perception',
                  participants: '234/500',
                  status: 'Active',
                  budget: '$22,500',
                  budgetUnit: 'USDC (Arc escrow)',
                  completion: 47,
                  responses: 234
                },
                {
                  title: 'Remote Work Productivity Analysis',
                  participants: '89/150',
                  status: 'Active',
                  budget: '$10,800',
                  budgetUnit: 'USDC (Arc escrow)',
                  completion: 59,
                  responses: 89
                },
                {
                  title: 'Sleep Pattern & Cognitive Performance',
                  participants: '0/300',
                  status: 'Draft',
                  budget: '$27,000',
                  budgetUnit: 'USDC (Arc escrow)',
                  completion: 0,
                  responses: 0
                }
              ].map((study, idx) => (
                <div key={idx} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{study.title}</h3>
                        <span className={`badge badge-${study.status === 'Active' ? 'active' : 'pending'}`}>
                          {study.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Participants</div>
                          <div style={{ fontSize: '16px', fontWeight: '600' }}>{study.participants}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Responses</div>
                          <div style={{ fontSize: '16px', fontWeight: '600' }}>{study.responses}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Budget Locked</div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#00f5d4' }}>{study.budget}</div>
                          <div style={{ fontSize: '11px', opacity: 0.6 }}>{study.budgetUnit}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '4px' }}>Completion</div>
                          <div style={{ fontSize: '16px', fontWeight: '600' }}>{study.completion}%</div>
                        </div>
                      </div>

                      {study.status === 'Active' && (
                        <div>
                          <div style={{ 
                            height: '6px', 
                            background: 'rgba(0, 217, 255, 0.1)', 
                            borderRadius: '3px',
                            overflow: 'hidden',
                            marginBottom: '12px'
                          }}>
                            <div style={{ 
                              width: `${study.completion}%`, 
                              height: '100%', 
                              background: 'linear-gradient(90deg, #7b2cbf, #00d9ff)',
                              borderRadius: '3px'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '24px', alignItems: 'flex-start' }}>
                      <button className="btn btn-secondary">
                        View Data
                      </button>
                      <button className="btn btn-secondary">
                        Manage
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[
                  { icon: <Shield size={24} />, title: 'Deploy Escrow', desc: 'Lock funds in smart contract' },
                  { icon: <TrendingUp size={24} />, title: 'Analytics Dashboard', desc: 'View real-time metrics' },
                  { icon: <Coins size={24} />, title: 'Manage Payments', desc: 'Release participant rewards' }
                ].map((action, idx) => (
                  <div key={idx} className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '32px 20px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(123, 44, 191, 0.2))',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#00d9ff'
                    }}>
                      {action.icon}
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>{action.title}</h4>
                    <p style={{ fontSize: '13px', opacity: 0.7 }}>{action.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Collaborate View */}
        {activeTab === 'collaborate' && (
          <div style={{ animation: 'slideIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Research Collaboration Hub</h2>
              <p style={{ opacity: 0.7, fontSize: '15px' }}>Share data, co-author studies, and access verified research results</p>
            </div>

            {/* Collaboration Features */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
              <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                  <Handshake size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Active Collaborations
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { partner: 'Stanford Neuroscience Lab', project: 'Memory & Aging Study', participants: '1,200' },
                    { partner: 'MIT Media Lab', project: 'AI Ethics Survey', participants: '850' }
                  ].map((collab, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(0, 217, 255, 0.05)',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 217, 255, 0.1)'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{collab.partner}</div>
                      <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>{collab.project}</div>
                      <div style={{ fontSize: '12px', color: '#00f5d4' }}>{collab.participants} shared participants</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
                  <Shield size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Shared Data Vault
                </h3>
                <div style={{ 
                  background: 'rgba(123, 44, 191, 0.1)', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(123, 44, 191, 0.3)',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Encrypted datasets available</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: '#7b2cbf' }}>24</div>
                </div>
                <button className="btn btn-secondary" style={{ width: '100%' }}>
                  Browse Datasets
                </button>
              </div>
            </div>

            {/* Published Results */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Published Results & Papers</h3>
                <button className="btn btn-primary">
                  + Publish Results
                </button>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  {
                    title: 'Impact of Social Media on Mental Health: A Blockchain-Verified Study',
                    authors: ['Dr. Sarah Chen', 'Dr. Michael Ross', 'You'],
                    citations: 47,
                    verified: true,
                    date: 'Dec 2025'
                  },
                  {
                    title: 'Cryptocurrency Adoption Patterns in Emerging Markets',
                    authors: ['Prof. James Liu', 'You'],
                    citations: 23,
                    verified: true,
                    date: 'Nov 2025'
                  }
                ].map((paper, idx) => (
                  <div key={idx} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{paper.title}</h4>
                          {paper.verified && (
                            <div style={{
                              background: 'rgba(0, 245, 212, 0.2)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              color: '#00f5d4',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle size={12} />
                              Verified
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.7, marginBottom: '12px' }}>
                          {paper.authors.join(' • ')}
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                          <span style={{ color: '#00d9ff' }}>{paper.citations} citations</span>
                          <span style={{ opacity: 0.6 }}>{paper.date}</span>
                        </div>
                      </div>
                      <button className="btn btn-secondary">
                        View Paper
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IP & Licensing */}
            <div style={{ marginTop: '40px', padding: '32px', background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.05), rgba(123, 44, 191, 0.05))', borderRadius: '12px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
                <Award size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                IP Rights & Licensing
              </h3>
              <p style={{ opacity: 0.8, marginBottom: '20px' }}>
                All research collaborations are governed by smart contracts ensuring transparent attribution,
                licensing terms, and revenue sharing for commercialized research.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#00d9ff', marginBottom: '4px' }}>100%</div>
                  <div style={{ fontSize: '13px', opacity: 0.7 }}>Attribution Accuracy</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#00f5d4', marginBottom: '4px' }}>Auto</div>
                  <div style={{ fontSize: '13px', opacity: 0.7 }}>Revenue Distribution</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#7b2cbf', marginBottom: '4px' }}>Immutable</div>
                  <div style={{ fontSize: '13px', opacity: 0.7 }}>Ownership Records</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network/Social View */}
        {activeTab === 'network' && (
          <div style={{ animation: 'slideIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Research Network</h2>
              <p style={{ opacity: 0.7, fontSize: '15px' }}>Connect with researchers and participants, build your reputation, and discover collaboration opportunities</p>
            </div>

            {/* Search and Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', opacity: 0.5 }} />
                <input 
                  type="text"
                  placeholder="Search researchers, participants, or expertise..."
                  style={{
                    background: 'rgba(0, 217, 255, 0.05)',
                    border: '1px solid rgba(0, 217, 255, 0.2)',
                    borderRadius: '8px',
                    padding: '10px 16px 10px 40px',
                    color: '#e8f4f8',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '14px',
                    width: '100%'
                  }}
                />
              </div>
              <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} />
                Filters
              </button>
            </div>

            {/* Featured Researchers */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                <Star size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#ffb74d' }} />
                Top Researchers
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {[
                  {
                    name: 'Dr. Sarah Chen',
                    title: 'Neuroscience Researcher',
                    institution: 'Stanford University',
                    ens: 'sarahchen.eth',
                    stars: 4.9,
                    studies: 47,
                    participants: 12500,
                    expertise: ['Neuroscience', 'AI Ethics', 'Cognitive Science'],
                    avatar: '🧠'
                  },
                  {
                    name: 'Prof. Michael Rodriguez',
                    title: 'Behavioral Economist',
                    institution: 'MIT',
                    ens: 'mrodriguez.eth',
                    stars: 4.8,
                    studies: 63,
                    participants: 18200,
                    expertise: ['Economics', 'Behavioral Science', 'DeFi'],
                    avatar: '📊'
                  },
                  {
                    name: 'Dr. Aisha Patel',
                    title: 'Clinical Psychologist',
                    institution: 'Johns Hopkins',
                    ens: 'apatel.eth',
                    stars: 5.0,
                    studies: 34,
                    participants: 8900,
                    expertise: ['Psychology', 'Mental Health', 'Wellbeing'],
                    avatar: '🧘'
                  }
                ].map((researcher, idx) => (
                  <div key={idx} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                    {/* Star Rating Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'linear-gradient(135deg, #ffb74d, #ff9800)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={14} fill="#fff" />
                      {researcher.stars}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(123, 44, 191, 0.3))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                      margin: '0 auto 16px',
                      border: '3px solid rgba(0, 217, 255, 0.5)'
                    }}>
                      {researcher.avatar}
                    </div>

                    <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{researcher.name}</h4>
                    {researcher.ens && (
                      <div style={{ fontSize: '12px', color: '#00f5d4', marginBottom: '4px', fontWeight: '600' }}>{researcher.ens}</div>
                    )}
                    <div style={{ fontSize: '13px', color: '#00d9ff', marginBottom: '4px' }}>{researcher.title}</div>
                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      {researcher.institution}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px', padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#00f5d4' }}>{researcher.studies}</div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Studies</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#7b2cbf' }}>{researcher.participants.toLocaleString()}</div>
                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Participants</div>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                      {researcher.expertise.map(tag => (
                        <span key={tag} style={{
                          padding: '4px 10px',
                          background: 'rgba(0, 217, 255, 0.1)',
                          borderRadius: '12px',
                          fontSize: '10px',
                          color: '#00d9ff',
                          border: '1px solid rgba(0, 217, 255, 0.3)'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary" style={{ flex: 1, fontSize: '12px', padding: '10px' }}>
                        <UserPlus size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Connect
                      </button>
                      <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', padding: '10px' }}>
                        <Link2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Participants */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                <CheckCircle size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#00f5d4' }} />
                Verified Participants
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                  {
                    name: 'Alex Thompson',
                    role: 'Research Participant',
                    stars: 4.95,
                    completed: 234,
                    specialties: ['Psychology', 'Health', 'UX Testing'],
                    avatar: '👨‍💼',
                    verified: true
                  },
                  {
                    name: 'Maya Nguyen',
                    role: 'Beta Tester & Participant',
                    stars: 5.0,
                    completed: 187,
                    specialties: ['Product Testing', 'Tech', 'Surveys'],
                    avatar: '👩‍💻',
                    verified: true
                  },
                  {
                    name: 'James Wilson',
                    role: 'Clinical Trial Participant',
                    stars: 4.88,
                    completed: 156,
                    specialties: ['Healthcare', 'Wearables', 'Nutrition'],
                    avatar: '👨‍⚕️',
                    verified: true
                  },
                  {
                    name: 'Sofia Garcia',
                    role: 'Academic Research Helper',
                    stars: 4.92,
                    completed: 298,
                    specialties: ['Economics', 'Sociology', 'Data'],
                    avatar: '👩‍🎓',
                    verified: true
                  }
                ].map((participant, idx) => (
                  <div key={idx} className="card" style={{ padding: '20px', position: 'relative' }}>
                    {/* Verified Badge */}
                    {participant.verified && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'rgba(0, 245, 212, 0.2)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        color: '#00f5d4',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: '1px solid #00f5d4'
                      }}>
                        <CheckCircle size={12} />
                        Verified
                      </div>
                    )}

                    {/* Avatar */}
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'linear-gradient(135deg, rgba(0, 245, 212, 0.3), rgba(0, 217, 255, 0.3))',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '30px',
                      margin: '0 auto 12px',
                      border: '2px solid rgba(0, 245, 212, 0.5)'
                    }}>
                      {participant.avatar}
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px', textAlign: 'center' }}>{participant.name}</h4>
                    <div style={{ fontSize: '12px', opacity: 0.6, marginBottom: '12px', textAlign: 'center' }}>{participant.role}</div>

                    {/* Star Rating */}
                    <div style={{
                      background: 'rgba(255, 183, 77, 0.1)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      marginBottom: '12px',
                      border: '1px solid rgba(255, 183, 77, 0.3)'
                    }}>
                      <Star size={14} fill="#ffb74d" color="#ffb74d" />
                      {participant.stars} • {participant.completed} studies
                    </div>

                    {/* Specialties */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
                      {participant.specialties.map(tag => (
                        <span key={tag} style={{
                          padding: '3px 8px',
                          background: 'rgba(123, 44, 191, 0.1)',
                          borderRadius: '10px',
                          fontSize: '9px',
                          color: '#7b2cbf',
                          border: '1px solid rgba(123, 44, 191, 0.3)'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px' }}>
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics & Communities */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* Recent Activity Feed */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                  <TrendingUp size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Recent Network Activity
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    {
                      user: 'Dr. Sarah Chen',
                      action: 'published new results',
                      subject: '"AI Bias in Healthcare Algorithms"',
                      time: '2 hours ago',
                      type: 'publication'
                    },
                    {
                      user: 'Alex Thompson',
                      action: 'completed study',
                      subject: 'Climate Change Perception Survey',
                      time: '5 hours ago',
                      type: 'completion'
                    },
                    {
                      user: 'Prof. Michael Rodriguez',
                      action: 'started collaboration with',
                      subject: 'MIT Media Lab',
                      time: '1 day ago',
                      type: 'collaboration'
                    },
                    {
                      user: 'Maya Nguyen',
                      action: 'earned 5-star rating from',
                      subject: 'Memory & Aging Study',
                      time: '1 day ago',
                      type: 'achievement'
                    }
                  ].map((activity, idx) => (
                    <div key={idx} className="card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'start' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: activity.type === 'publication' ? '#00d9ff' : 
                                   activity.type === 'completion' ? '#00f5d4' : 
                                   activity.type === 'collaboration' ? '#7b2cbf' : '#ffb74d',
                        marginTop: '6px',
                        flexShrink: 0
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#00d9ff' }}>{activity.user}</span>
                          {' '}{activity.action}{' '}
                          <span style={{ fontStyle: 'italic' }}>{activity.subject}</span>
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.5 }}>{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communities/Tags */}
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>
                  Trending Topics
                </h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { name: 'AI Ethics', count: 234, growth: '+12%' },
                    { name: 'Mental Health', count: 189, growth: '+8%' },
                    { name: 'Climate Science', count: 156, growth: '+15%' },
                    { name: 'Web3 Research', count: 142, growth: '+22%' },
                    { name: 'Behavioral Economics', count: 128, growth: '+5%' }
                  ].map((topic, idx) => (
                    <div key={idx} className="card" style={{ padding: '16px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{topic.name}</div>
                          <div style={{ fontSize: '12px', opacity: 0.6 }}>{topic.count} researchers</div>
                        </div>
                        <div style={{
                          background: 'rgba(0, 245, 212, 0.2)',
                          color: '#00f5d4',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {topic.growth}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Join Community CTA */}
                <div className="card" style={{
                  marginTop: '20px',
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(123, 44, 191, 0.1))',
                  textAlign: 'center'
                }}>
                  <MessageCircle size={32} style={{ color: '#00d9ff', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>Join the Conversation</h4>
                  <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '16px' }}>
                    Connect with researchers and participants in your field
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%' }}>
                    Explore Communities
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        padding: '40px',
        borderTop: '1px solid rgba(0, 217, 255, 0.2)',
        textAlign: 'center',
        opacity: 0.6,
        fontSize: '14px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <a href="https://ethglobal.com/events/hackmoney2026/prizes#ens" target="_blank" rel="noopener noreferrer" style={{ color: '#00f5d4', textDecoration: 'none', fontWeight: '700' }}>
            HackMoney 2026
          </a>
          {' • '}ENS • LI.FI • Arc • USDC
        </div>
        <div style={{ marginBottom: '12px' }}>
          Built on Ethereum • Escrow on Arc • Cross-chain via LI.FI • Payments in USDC
        </div>
        <div style={{ fontSize: '12px' }}>
          ResearchFi © 2026 • Decentralizing Research Participation
        </div>
      </footer>
    </div>
  );
}
