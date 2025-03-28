import create from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface Party {
  id: string;
  name: string;
  leaderName: string;
  description: string;
  imageUrl: string;
  symbol: string;
  votesReceived: number;
  createdAt: string;
  manifesto?: string;
}

interface PartyState {
  parties: Party[];
  addParty: (party: Omit<Party, 'id' | 'votesReceived' | 'createdAt'>) => void;
  updateParty: (id: string, party: Partial<Party>) => void;
  deleteParty: (id: string) => void;
  incrementVotes: (id: string) => void;
  getPartyById: (id: string) => Party | undefined;
  getAllParties: () => Party[];
  getVoteResults: () => { name: string; votes: number }[];
}

const usePartyStore = create<PartyState>()(
  persist(
    (set, get) => ({
      parties: [],

      addParty: (partyData) => {
        const newParty: Party = {
          ...partyData,
          id: crypto.randomUUID(),
          votesReceived: 0,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          parties: [...state.parties, newParty],
        }));
        toast.success('Party added successfully!');
      },

      updateParty: (id, updatedParty) => {
        set((state) => ({
          parties: state.parties.map((party) =>
            party.id === id ? { ...party, ...updatedParty } : party
          ),
        }));
        toast.success('Party updated successfully!');
      },

      deleteParty: (id) => {
        set((state) => ({
          parties: state.parties.filter((party) => party.id !== id),
        }));
        toast.success('Party deleted successfully!');
      },

      incrementVotes: (id) => {
        set((state) => ({
          parties: state.parties.map((party) =>
            party.id === id
              ? { ...party, votesReceived: party.votesReceived + 1 }
              : party
          ),
        }));
      },

      getPartyById: (id) => {
        return get().parties.find((party) => party.id === id);
      },

      getAllParties: () => {
        return get().parties;
      },

      getVoteResults: () => {
        return get().parties.map((party) => ({
          name: party.name,
          votes: party.votesReceived,
        }));
      },
    }),
    {
      name: 'party-storage',
      getStorage: () => localStorage,
    }
  )
);

export { usePartyStore };
