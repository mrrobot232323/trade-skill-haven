import React from 'react';
import MatchFinder from '@/components/MatchFinder';
import { Match } from '@/types';
import { useToast } from '@/components/Toast';

const Matches: React.FC = () => {
  const { success } = useToast();

  const handleRequestSwap = (match: Match) => {
    success(
      'Swap request sent!',
      `Your request to swap skills with ${match.user} has been sent.`
    );
  };

  return <MatchFinder onRequestSwap={handleRequestSwap} />;
};

export default Matches;