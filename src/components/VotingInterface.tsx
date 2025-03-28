import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useElectionStore } from '../store/electionStore';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Clock, LogOut, CheckCircle } from 'lucide-react';

const VotingInterface: React.FC = () => {
  const navigate = useNavigate();
  const [isVoting, setIsVoting] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const { isAuthenticated, userMetadata, signOut } = useAuthStore();
  const { 
    parties, 
    isVotingActive, 
    recordVote, 
    getRemainingTime,
    votingStartTime,
    votingEndTime
  } = useElectionStore();
  const { account, isMetaMaskInstalled, isCorrectNetwork, connectForVoting } = useWeb3();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!account || !isCorrectNetwork) {
      toast.error('Please ensure your wallet is connected and on the correct network');
    }
  }, [account, isCorrectNetwork]);

  useEffect(() => {
    if (account) {
      const time = getRemainingTime(account);
      setRemainingTime(time);

      const timer = setInterval(() => {
        const updatedTime = getRemainingTime(account);
        if (updatedTime !== null) {
          setRemainingTime(updatedTime);
          if (updatedTime <= 0) {
            clearInterval(timer);
          }
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [account, getRemainingTime]);

  const handleVote = async (partyId: string) => {
    if (!account) {
      toast.error('Please connect your wallet to vote');
      return;
    }

    if (!isCorrectNetwork) {
      toast.error('Please switch to the Ganache network');
      return;
    }

    if (!isVotingActive()) {
      toast.error('Voting is not currently active');
      return;
    }

    if (remainingTime !== null && remainingTime <= 0) {
      toast.error('Your voting time has expired');
      return;
    }

    try {
      setIsVoting(true);
      const success = recordVote(account + '-' + Date.now(), partyId);
      if (success) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Vote cast successfully!');
      }
    } catch (error) {
      console.error('Voting error:', error);
      toast.error('Failed to cast vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isAuthenticated || !userMetadata) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      {/* Navbar */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Secure Voting System
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              {!isMetaMaskInstalled ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Install MetaMask
                </motion.button>
              ) : !account ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectForVoting}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Connect Wallet
                </motion.button>
              ) : !isCorrectNetwork ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={connectForVoting}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Switch Network
                </motion.button>
              ) : (
                <span className="px-4 py-2 rounded-full bg-white/10 text-white font-medium">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voting Status Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="mb-8 p-6 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20"
        >
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold">Voting Status</h2>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-white/60">Start Time</p>
              <p className="font-medium">{formatDateTime(votingStartTime)}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">End Time</p>
              <p className="font-medium">{formatDateTime(votingEndTime)}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Your Remaining Time</p>
              <p className="font-medium">{formatTime(remainingTime)}</p>
            </div>
          </div>
        </motion.div>

        {/* Party Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.map((party, index) => (
            <motion.div
              key={party.id}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 group"
            >
              {/* Party Flag */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <img 
                  src={party.flag || '/placeholder-flag.png'} 
                  alt={`${party.name} flag`}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute bottom-4 left-4 z-20">
                  <h3 className="text-xl font-bold">{party.name}</h3>
                  <p className="text-sm text-white/80">{party.candidate}</p>
                </div>
              </div>

              {/* Party Info */}
              <div className="p-4">
                <p className="text-sm text-white/60 mb-4">{party.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={party.symbol || '/placeholder-symbol.png'} 
                      alt={`${party.name} symbol`}
                      className="w-8 h-8 rounded-full bg-white/10"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleVote(party.id)}
                    disabled={isVoting || !isVotingActive() || (remainingTime !== null && remainingTime <= 0)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    {isVoting ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Vote</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VotingInterface;
