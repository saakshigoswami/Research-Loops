import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmi';
import App from './App';
import { LandingPage } from './pages/LandingPage';
import { ResearcherGate } from './pages/ResearcherGate';
import { StudiesGate } from './pages/StudiesGate';
import { ParticipantDashboardGate } from './pages/ParticipantDashboardGate';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/researcher/dashboard" element={<ResearcherGate />} />
              <Route path="/studies" element={<StudiesGate />} />
              <Route path="/participant/dashboard" element={<ParticipantDashboardGate />} />
              <Route path="/researcher" element={<Navigate to="/researcher/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
