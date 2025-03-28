import create from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

interface UserMetadata {
  email: string;
  role: 'admin' | 'voter';
  walletAddress?: string;
  aadhar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userMetadata: UserMetadata | null;
  walletAddress: string;
  isWalletConnecting: boolean;
  signIn: (email: string, aadhar: string, isAdmin: boolean, walletAddress?: string) => Promise<void>;
  signOut: () => void;
  updateWalletAddress: (address: string) => void;
  getWalletAddress: () => string;
  setWalletConnecting: (isConnecting: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userMetadata: null,
      walletAddress: '',
      isWalletConnecting: false,

      signIn: async (email: string, aadhar: string, isAdmin: boolean, walletAddress?: string) => {
        try {
          // Input validation
          if (!email || !aadhar) {
            throw new Error('Email and Aadhar number are required');
          }

          if (!isAdmin && !walletAddress) {
            throw new Error('Please connect your wallet to continue');
          }

          // Admin login
          if (isAdmin) {
            if (email === 'admin@voting.gov' && aadhar === '123456789012') {
              set({
                isAuthenticated: true,
                userMetadata: {
                  email,
                  role: 'admin',
                  aadhar
                }
              });
              toast.success('Welcome back, Admin!');
              return;
            }
            throw new Error('Invalid admin credentials');
          }

          // Voter login with wallet
          set({
            isAuthenticated: true,
            userMetadata: {
              email,
              role: 'voter',
              walletAddress,
              aadhar
            },
            walletAddress
          });
          toast.success('Successfully logged in!');

        } catch (error: any) {
          toast.error(error.message || 'Authentication failed');
          throw error;
        }
      },

      signOut: () => {
        set({
          isAuthenticated: false,
          userMetadata: null,
          walletAddress: ''
        });
        toast.success('Logged out successfully');
      },

      updateWalletAddress: (address: string) => {
        if (!address) {
          toast.error('Invalid wallet address');
          return;
        }
        set({ walletAddress: address });
        toast.success('Wallet connected successfully');
      },

      getWalletAddress: () => {
        return get().walletAddress;
      },

      setWalletConnecting: (isConnecting: boolean) => {
        set({ isWalletConnecting: isConnecting });
      }
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userMetadata: state.userMetadata,
        walletAddress: state.walletAddress
      })
    }
  )
);

export { useAuthStore };
export type { UserMetadata };