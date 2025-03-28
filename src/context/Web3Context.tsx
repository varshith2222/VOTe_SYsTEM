import React, { createContext, useContext, useState, useEffect } from 'react';
import { web3Service } from '../services/web3Service';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { ethers } from 'ethers';

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  connectForVoting: () => Promise<void>;
  isMetaMaskInstalled: boolean;
  isCorrectNetwork: boolean;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  isConnecting: false,
  connect: async () => {},
  disconnect: () => {},
  connectForVoting: async () => {},
  isMetaMaskInstalled: false,
  isCorrectNetwork: false
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const { updateWalletAddress, walletAddress } = useAuthStore();

  // Initialize provider and check MetaMask installation
  useEffect(() => {
    const initializeWeb3 = async () => {
      const hasMetaMask = typeof window !== 'undefined' && !!window.ethereum;
      setIsMetaMaskInstalled(hasMetaMask);
      
      if (hasMetaMask) {
        try {
          // Initialize provider
          const provider = new ethers.providers.Web3Provider(window.ethereum as any);
          await provider.ready; // Ensure provider is ready
          
          const network = await provider.getNetwork();
          const correctNetwork = network.chainId === 1337; // Ganache default chainId
          setIsCorrectNetwork(correctNetwork);
          
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            updateWalletAddress(accounts[0]);
          }
        } catch (error) {
          console.error('Error initializing Web3:', error);
          setIsCorrectNetwork(false);
          setAccount(null);
          updateWalletAddress('');
        }
      }
    };
    
    initializeWeb3();
  }, [updateWalletAddress]);

  // Check for existing connection and sync with stored wallet address
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connectedAccount = await web3Service.getConnectedAccount();
        
        if (connectedAccount) {
          const correctNetwork = await web3Service.isCorrectNetwork();
          if (correctNetwork) {
            setAccount(connectedAccount);
            updateWalletAddress(connectedAccount);
            setIsCorrectNetwork(true);
          } else {
            setAccount(null);
            updateWalletAddress('');
            setIsCorrectNetwork(false);
          }
        } else if (walletAddress) {
          // Clear stored wallet if no active connection
          updateWalletAddress('');
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        updateWalletAddress('');
      }
    };
    checkConnection();
  }, [updateWalletAddress, walletAddress]);

  // Set up MetaMask event listeners
  useEffect(() => {
    if (window.ethereum) {
      setupEventListeners();
      return () => removeEventListeners();
    }
  }, []);

  const setupEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Check connection on visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);
  };

  const removeEventListeners = () => {
    if (!window.ethereum) return;

    window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    window.ethereum.removeListener('disconnect', handleDisconnect);
    window.ethereum.removeListener('chainChanged', handleChainChanged);
    
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  const handleChainChanged = async () => {
    const correctNetwork = await web3Service.isCorrectNetwork();
    setIsCorrectNetwork(correctNetwork);
    
    if (!correctNetwork) {
      setAccount(null);
      updateWalletAddress('');
      toast.error('Please switch to the Ganache network');
    }
  };

  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      const connectedAccount = await web3Service.getConnectedAccount();
      if (!connectedAccount && account) {
        handleDisconnect();
      }
    }
  };

  const handleAccountsChanged = async (accounts: unknown) => {
    if (Array.isArray(accounts) && accounts.length === 0) {
      disconnect();
      toast.error('Wallet disconnected');
    } else if (Array.isArray(accounts) && typeof accounts[0] === 'string') {
      const correctNetwork = await web3Service.isCorrectNetwork();
      if (correctNetwork) {
        setAccount(accounts[0]);
        updateWalletAddress(accounts[0]);
        setIsCorrectNetwork(true);
        toast.success('Wallet account changed');
      } else {
        setAccount(null);
        updateWalletAddress('');
        setIsCorrectNetwork(false);
        toast.error('Please switch to the Ganache network');
      }
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    updateWalletAddress('');
    toast.error('Wallet disconnected');
  };

  const disconnect = () => {
    setAccount(null);
    updateWalletAddress('');
    setIsCorrectNetwork(false);
  };

  // Used for both initial login and voting actions
  const connectForVoting = async (): Promise<void> => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask to continue');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      const connectedAccount = await web3Service.connectWallet();
      const correctNetwork = await web3Service.isCorrectNetwork();
      
      if (correctNetwork) {
        setAccount(connectedAccount);
        updateWalletAddress(connectedAccount);
        setIsCorrectNetwork(true);
        toast.success('Wallet connected successfully');
      } else {
        setAccount(null);
        updateWalletAddress('');
        setIsCorrectNetwork(false);
        toast.error('Please switch to the Ganache network');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setAccount(null);
      updateWalletAddress('');
      
      if (error.message.includes('User rejected')) {
        toast.error('Please connect your wallet to continue');
      } else if (error.message.includes('MetaMask is not installed')) {
        toast.error('Please install MetaMask');
        window.open('https://metamask.io/download/', '_blank');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  // Legacy connect method - kept for backward compatibility
  const connect = async (): Promise<void> => {
    return connectForVoting();
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        isConnecting,
        connect,
        disconnect,
        connectForVoting,
        isMetaMaskInstalled,
        isCorrectNetwork
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
