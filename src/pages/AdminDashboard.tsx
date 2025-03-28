import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, PieChart, Users, Award, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePartyStore } from '../store/partyStore';
import type { Party } from '../store/partyStore';
import AddPartyForm from '../components/admin/AddPartyForm';
import PartyList from '../components/admin/PartyList';
import { toast } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [showAddParty, setShowAddParty] = useState(false);
  const { userMetadata, isAuthenticated, signOut } = useAuthStore();
  const { parties, addParty, updateParty, deleteParty } = usePartyStore();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated || userMetadata?.role !== 'admin') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, userMetadata, navigate]);

  const handleAddParty = (partyData: Omit<Party, 'id' | 'votesReceived' | 'createdAt'>) => {
    try {
      addParty(partyData);
      setShowAddParty(false);
    } catch (error) {
      toast.error('Failed to add party. Please try again.');
    }
  };

  const handleEditParty = (party: Party) => {
    try {
      updateParty(party.id, party);
    } catch (error) {
      toast.error('Failed to update party. Please try again.');
    }
  };

  const handleDeleteParty = (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this party?')) {
        deleteParty(id);
      }
    } catch (error) {
      toast.error('Failed to delete party. Please try again.');
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const getTotalVotes = () => {
    return parties.reduce((sum, party) => sum + party.votesReceived, 0);
  };

  if (!isAuthenticated || userMetadata?.role !== 'admin') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Admin Dashboard
            </h1>
            <p className="text-white/60 mt-2">
              Welcome back, {userMetadata?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddParty(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Party
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignOut}
              className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">
                Total Parties
              </h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">
              {parties.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center">
              <Award className="w-6 h-6 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Total Votes</h3>
            </div>
            <p className="text-3xl font-bold text-white mt-2">
              {getTotalVotes()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-lg border border-white/10"
          >
            <div className="flex items-center">
              <PieChart className="w-6 h-6 text-purple-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">
                Vote Distribution
              </h3>
            </div>
            <p className="text-sm text-white/60 mt-2">
              Click to view detailed analytics
            </p>
          </motion.div>
        </div>

        {/* Party List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/10 p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">
            Registered Parties
          </h2>
          {parties.length === 0 ? (
            <p className="text-white/60 text-center py-8">
              No parties registered yet. Click "Add Party" to get started.
            </p>
          ) : (
            <PartyList
              parties={parties}
              onEdit={handleEditParty}
              onDelete={handleDeleteParty}
            />
          )}
        </motion.div>
      </div>

      {/* Add Party Modal */}
      <AnimatePresence>
        {showAddParty && (
          <AddPartyForm
            onSubmit={handleAddParty}
            onClose={() => setShowAddParty(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
