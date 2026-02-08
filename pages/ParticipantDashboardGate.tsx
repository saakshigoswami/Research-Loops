import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import App from '../App';

export function ParticipantDashboardGate() {
  const { address } = useAccount();
  if (!address) return <Navigate to="/" replace />;
  return <App mode="participant" address={address} participantTab="my-dashboard" />;
}
