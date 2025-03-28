import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useElectionStore } from '../store/electionStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  LogOut, 
  Plus,
  X,
  Edit2
} from 'lucide-react';

interface PartyFormData {
  name: string;
  candidate: string;
  description: string;
  symbol: string;
  flag: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showAddParty, setShowAddParty] = useState(false);
  const [showVotingConfig, setShowVotingConfig] = useState(false);
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<PartyFormData>({
    name: '',
    candidate: '',
    description: '',
    symbol: '',
    flag: ''
  });

  const [votingSettings, setVotingSettings] = useState({
    startTime: '',
    endTime: '',
    duration: 5
  });

  const { isAuthenticated, userMetadata, signOut } = useAuthStore();
  const { 
    parties, 
    addParty,
    updateParty,
    setVotingTimes,
    setVotingDuration,
    getTotalVotes
  } = useElectionStore();

  React.useEffect(() => {
    if (!isAuthenticated || userMetadata?.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, userMetadata, navigate]);

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedParty) {
        await updateParty(selectedParty, formData);
        toast.success('Party updated successfully!');
      } else {
        await addParty(formData);
        toast.success('Party added successfully!');
      }
      resetForm();
    } catch (error) {
      toast.error('Failed to save party details');
      console.error('Error saving party:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      candidate: '',
      description: '',
      symbol: '',
      flag: ''
    });
    setPreviewImage(null);
    setSelectedParty(null);
    setShowAddParty(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'symbol' | 'flag') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Here you would typically upload to a server/IPFS
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [field]: url }));
      if (field === 'flag') {
        setPreviewImage(url);
      }
    } catch (error) {
      toast.error(`Failed to upload ${field}`);
      console.error('Upload error:', error);
    }
  };

  const handleEditParty = (party: any) => {
    setFormData({
      name: party.name,
      candidate: party.candidate,
      description: party.description,
      symbol: party.symbol,
      flag: party.flag
    });
    setSelectedParty(party.id);
    setPreviewImage(party.flag);
    setShowAddParty(true);
  };

  const handleVotingSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setVotingTimes(votingSettings.startTime, votingSettings.endTime);
      setVotingDuration(votingSettings.duration);
      toast.success('Voting settings updated successfully!');
      setShowVotingConfig(false);
    } catch (error) {
      toast.error('Failed to update voting settings');
      console.error('Settings error:', error);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
                Admin Dashboard
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowVotingConfig(!showVotingConfig)}
                className="px-4 py-2 rounded-full bg-white/10 text-white font-medium"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
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
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Election Management</h2>
            <p className="text-white/60">Total Votes Cast: {getTotalVotes()}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowAddParty(!showAddParty);
              if (!showAddParty) {
                resetForm();
              }
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
          >
            {showAddParty ? (
              <>
                <X className="w-5 h-5" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add New Party</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Party Form */}
        <AnimatePresence>
          {showAddParty && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold mb-6">
                  {selectedParty ? 'Edit Party' : 'Add New Party'}
                </h3>
                <form onSubmit={handleAddParty} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Party Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter party name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Candidate Name</label>
                      <input
                        type="text"
                        required
                        value={formData.candidate}
                        onChange={(e) => setFormData(prev => ({ ...prev, candidate: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter candidate name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter party description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Party Symbol</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'symbol')}
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                        />
                      </div>
                      {formData.symbol && (
                        <div className="mt-2 relative">
                          <img 
                            src={formData.symbol} 
                            alt="Symbol preview" 
                            className="h-20 w-20 object-contain rounded-lg bg-white/5 p-2" 
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Party Flag</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'flag')}
                          className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                        />
                      </div>
                      {previewImage && (
                        <div className="mt-2 relative">
                          <img 
                            src={previewImage} 
                            alt="Flag preview" 
                            className="h-20 w-20 object-cover rounded-lg" 
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl bg-white/10 text-white font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      {selectedParty ? 'Update Party' : 'Add Party'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voting Settings */}
        <AnimatePresence>
          {showVotingConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
                <h3 className="text-xl font-semibold mb-6">Voting Settings</h3>
                <form onSubmit={handleVotingSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={votingSettings.startTime}
                        onChange={(e) => setVotingSettings(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">End Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={votingSettings.endTime}
                        onChange={(e) => setVotingSettings(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Time Per Voter (minutes)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="60"
                        value={votingSettings.duration}
                        onChange={(e) => setVotingSettings(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                      Save Settings
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                    <span className="text-sm font-medium">Votes: {party.votes}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEditParty(party)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
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

export default AdminDashboard;