import User from '../models/User';
import PartyFlag from '../models/PartyFlag';
import { web3Service } from './web3Service';

class ApiService {
  async loginWithMetaMask(): Promise<{ user: any; token: string }> {
    try {
      const walletAddress = await web3Service.connectWallet();
      
      // Sign a message to verify ownership of the wallet
      const message = `Login to Party Flags at ${new Date().toISOString()}`;
      const signature = await web3Service.signMessage(message);

      // Find or create user
      let user = await User.findOne({ walletAddress });
      
      if (!user) {
        user = await User.create({
          walletAddress,
          username: `User-${walletAddress.slice(0, 6)}`,
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      return {
        user,
        token: signature // In a real app, you'd want to create a proper JWT here
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async createPartyFlag(data: {
    name: string;
    symbol: string;
    image: string;
    description?: string;
    tokenId: string;
    owner: string;
    metadata?: any;
  }) {
    try {
      const partyFlag = await PartyFlag.create(data);
      return partyFlag;
    } catch (error) {
      console.error('Error creating party flag:', error);
      throw error;
    }
  }

  async getPartyFlags(owner?: string) {
    try {
      const query = owner ? { owner } : {};
      const flags = await PartyFlag.find(query).sort({ createdAt: -1 });
      return flags;
    } catch (error) {
      console.error('Error fetching party flags:', error);
      throw error;
    }
  }

  async getPartyFlagByTokenId(tokenId: string) {
    try {
      const flag = await PartyFlag.findOne({ tokenId });
      return flag;
    } catch (error) {
      console.error('Error fetching party flag:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
