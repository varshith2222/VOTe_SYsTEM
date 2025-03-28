import { ethers } from 'ethers';
import type { MetaMaskInpageProvider } from "@metamask/providers";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

class Web3Service {
  private provider: ethers.providers.Web3Provider | null = null;
  private networkConfig = {
    chainId: '0x539', // 1337 in hex
    chainName: 'Ganache Local',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['http://127.0.0.1:7545']
  };

  async connectWallet(): Promise<string> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      // First request account access
      const response = await window.ethereum.request<string[]>({
        method: 'eth_requestAccounts'
      });

      if (!response || response.length === 0) {
        throw new Error('No accounts found');
      }

      const [account] = response;
      if (!account) {
        throw new Error('No account found');
      }

      // Initialize provider
      this.provider = new ethers.providers.Web3Provider(window.ethereum as any);

      // Then try to switch to Ganache network
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.networkConfig.chainId }],
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [this.networkConfig],
            });
          } catch (addError: any) {
            if (addError.code === 4001) {
              throw new Error('User rejected network addition');
            }
            throw addError;
          }
        } else if (switchError.code === 4001) {
          throw new Error('User rejected network switch');
        } else {
          throw switchError;
        }
      }

      // Verify we're still connected after network switch
      const verifyResponse = await window.ethereum.request<string[]>({
        method: 'eth_accounts'
      });

      if (!verifyResponse || verifyResponse.length === 0) {
        throw new Error('Lost connection after network switch');
      }

      const [verifiedAccount] = verifyResponse;
      if (!verifiedAccount) {
        throw new Error('No account found after network switch');
      }

      return verifiedAccount;
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      throw error;
    }
  }

  async getConnectedAccount(): Promise<string | null> {
    try {
      if (!window.ethereum) {
        return null;
      }

      const response = await window.ethereum.request<string[]>({
        method: 'eth_accounts'
      });

      if (!response || response.length === 0) {
        return null;
      }

      const [account] = response;
      return account || null;
    } catch (error) {
      console.error('Error getting connected account:', error);
      return null;
    }
  }

  async isCorrectNetwork(): Promise<boolean> {
    try {
      if (!window.ethereum) return false;

      const chainId = await window.ethereum.request<string>({
        method: 'eth_chainId'
      });

      return chainId === this.networkConfig.chainId;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const signer = this.provider.getSigner();
    return await signer.signMessage(message);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
}

export const web3Service = new Web3Service();
