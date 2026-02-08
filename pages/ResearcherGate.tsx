import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import App from '../App';

export function ResearcherGate() {
  const { address } = useAccount();
  if (!address) return <Navigate to="/" replace />;
  return <App mode="researcher" address={address} />;
}
