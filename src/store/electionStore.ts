import create from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface Party {
  id: string;
  name: string;
  symbol: string;
  flag: string;
  candidate: string;
  description: string;
  votes: number;
}

interface ElectionState {
  parties: Party[];
  votingStartTime: string | null;
  votingEndTime: string | null;
  votingDurationPerUser: number; // in minutes
  hasVoted: string[]; // array of wallet addresses that have voted
  addParty: (party: Omit<Party, 'id' | 'votes'>) => void;
  updateParty: (id: string, party: Omit<Party, 'id' | 'votes'>) => void;
  removeParty: (id: string) => void;
  setVotingTimes: (start: string, end: string) => void;
  setVotingDuration: (minutes: number) => void;
  recordVote: (walletAddress: string, partyId: string) => boolean;
  isVotingActive: () => boolean;
  getRemainingTime: (walletAddress: string) => number | null;
  getVoteCounts: () => { [key: string]: number };
  getTotalVotes: () => number;
}

export const useElectionStore = create<ElectionState>()(
  persist(
    (set, get) => ({
      parties: [],
      votingStartTime: null,
      votingEndTime: null,
      votingDurationPerUser: 5, // default 5 minutes
      hasVoted: [],

      addParty: (party) => {
        set((state) => ({
          parties: [...state.parties, { ...party, id: Date.now().toString(), votes: 0 }]
        }));
        toast.success('Party added successfully');
      },

      updateParty: (id, party) => {
        set((state) => ({
          parties: state.parties.map(p => 
            p.id === id 
              ? { ...p, ...party }
              : p
          )
        }));
        toast.success('Party updated successfully');
      },

      removeParty: (id) => {
        set((state) => ({
          parties: state.parties.filter(p => p.id !== id)
        }));
        toast.success('Party removed successfully');
      },

      setVotingTimes: (start, end) => {
        set({ votingStartTime: start, votingEndTime: end });
        toast.success('Voting time period set successfully');
      },

      setVotingDuration: (minutes) => {
        set({ votingDurationPerUser: minutes });
        toast.success(`Voting duration set to ${minutes} minutes per user`);
      },

      recordVote: (walletAddress, partyId) => {
        const state = get();
        if (state.hasVoted.includes(walletAddress)) {
          toast.error('This wallet has already voted');
          return false;
        }

        set((state) => ({
          hasVoted: [...state.hasVoted, walletAddress],
          parties: state.parties.map(p => 
            p.id === partyId ? { ...p, votes: p.votes + 1 } : p
          )
        }));
        return true;
      },

      isVotingActive: () => {
        const state = get();
        const now = new Date().getTime();
        const start = state.votingStartTime ? new Date(state.votingStartTime).getTime() : null;
        const end = state.votingEndTime ? new Date(state.votingEndTime).getTime() : null;
        
        if (!start || !end) return false;
        return now >= start && now <= end;
      },

      getRemainingTime: (walletAddress) => {
        const state = get();
        const voteTime = state.hasVoted.indexOf(walletAddress);
        if (voteTime === -1) return state.votingDurationPerUser * 60; // convert to seconds
        
        const now = new Date().getTime();
        const voteTimestamp = parseInt(walletAddress.split('-')[1] || '0');
        const elapsed = (now - voteTimestamp) / 1000; // convert to seconds
        const remaining = (state.votingDurationPerUser * 60) - elapsed;
        
        return remaining > 0 ? remaining : 0;
      },

      getVoteCounts: () => {
        const state = get();
        return state.parties.reduce((acc, party) => {
          acc[party.name] = party.votes;
          return acc;
        }, {} as { [key: string]: number });
      },

      getTotalVotes: () => {
        const state = get();
        return state.parties.reduce((sum, party) => sum + party.votes, 0);
      }
    }),
    {
      name: 'election-storage',
      getStorage: () => localStorage
    }
  )
);
