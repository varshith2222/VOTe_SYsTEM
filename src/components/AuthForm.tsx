import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useWeb3 } from '../context/Web3Context';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Wallet, User, Shield, ChevronRight, Mail, Key } from 'lucide-react';

interface AuthFormProps {
  isAdmin?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isAdmin = false }) => {
  const [email, setEmail] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated, userMetadata } = useAuthStore();
  const { account, isMetaMaskInstalled, connectForVoting, isCorrectNetwork } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && userMetadata) {
      if (userMetadata.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/vote');
      }
    }
  }, [isAuthenticated, userMetadata, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For voters, require wallet connection
    if (!isAdmin) {
      if (!account) {
        toast.error('Please connect your wallet first');
        return;
      }

      if (!isCorrectNetwork) {
        toast.error('Please switch to the correct network');
        return;
      }
    }

    try {
      setIsLoading(true);
      // Convert account from string | null to string | undefined for signIn
      await signIn(email, aadhar, isAdmin, account || undefined);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } }
  };

  const buttonVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.h2
            className="mt-6 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isAdmin ? 'Admin Login' : 'Voter Login'}
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Secure {isAdmin ? 'Administration' : 'Voting'} Platform
          </motion.p>
        </motion.div>

        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20"
        >
          {/* Wallet Connection Section */}
          {!isAdmin && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white flex items-center">
                  <Wallet className="w-5 h-5 mr-2" />
                  Wallet Connection
                </h3>
                {account && (
                  <span className="text-sm text-green-400">
                    Connected
                  </span>
                )}
              </div>
              {!isMetaMaskInstalled ? (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => window.open('https://metamask.io/download/', '_blank')}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium transition-all"
                >
                  Install MetaMask
                  <ChevronRight className="w-5 h-5 ml-2" />
                </motion.button>
              ) : !account ? (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={connectForVoting}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium transition-all"
                >
                  Connect Wallet
                  <ChevronRight className="w-5 h-5 ml-2" />
                </motion.button>
              ) : !isCorrectNetwork ? (
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={connectForVoting}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium transition-all"
                >
                  Switch Network
                  <ChevronRight className="w-5 h-5 ml-2" />
                </motion.button>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/80">
                    Connected: {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500 transition-all"
                placeholder={isAdmin ? "admin@voting.gov" : "Enter your email"}
              />
            </div>

            <div>
              <label htmlFor="aadhar" className="block text-sm font-medium text-white/80 mb-2">
                <Key className="w-4 h-4 inline mr-2" />
                Aadhar Number
              </label>
              <input
                id="aadhar"
                type="password"
                required
                value={aadhar}
                onChange={(e) => setAadhar(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500 transition-all"
                placeholder="Enter your Aadhar number"
              />
            </div>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              type="submit"
              disabled={!isAdmin && (!account || !isCorrectNetwork) || isLoading}
              className="w-full flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isAdmin ? <Shield className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
                  {isAdmin ? 'Admin Login' : 'Voter Login'}
                </>
              )}
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4"
            >
              <a
                href={isAdmin ? "/" : "/admin"}
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                {isAdmin ? 'Login as Voter' : 'Login as Admin'}
              </a>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthForm;