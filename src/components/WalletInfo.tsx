import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { web3Service } from '../services/web3Service';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw } from 'lucide-react';

export function WalletInfo() {
  const { account } = useWeb3();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = async () => {
    if (!account) return;
    setIsLoading(true);
    try {
      const balance = await web3Service.getBalance(account);
      setBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [account]);

  if (!account) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Wallet className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Wallet Info</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchBalance}
          className="text-indigo-600 hover:text-indigo-700"
          disabled={isLoading}
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-gray-600">Address:</p>
        <p className="font-mono text-sm break-all">{account}</p>
      </div>
      
      <div className="mt-2">
        <p className="text-sm text-gray-600">Balance:</p>
        <p className="font-mono text-sm">
          {isLoading ? (
            'Loading...'
          ) : balance ? (
            `${parseFloat(balance).toFixed(4)} ETH`
          ) : (
            'Error loading balance'
          )}
        </p>
      </div>
    </motion.div>
  );
}
