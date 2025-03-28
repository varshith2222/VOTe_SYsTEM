import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Award, User, Calendar } from 'lucide-react';
import { Party } from '../../store/partyStore';

interface PartyListProps {
  parties: Party[];
  onEdit: (party: Party) => void;
  onDelete: (id: string) => void;
}

const PartyList: React.FC<PartyListProps> = ({ parties, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {parties.map((party, index) => (
          <motion.div
            key={party.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
          >
            <div className="relative">
              {party.imageUrl && (
                <img
                  src={party.imageUrl}
                  alt={party.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="absolute top-2 right-2 flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(party)}
                  className="p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-blue-400" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(party.id)}
                  className="p-2 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </motion.button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">
                  {party.name}
                </h3>
                <span className="text-sm text-white/60 bg-white/10 px-2 py-1 rounded">
                  {party.symbol}
                </span>
              </div>

              <div className="flex items-center text-white/80 mb-2">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">{party.leaderName}</span>
              </div>

              {party.description && (
                <p className="text-sm text-white/60 mb-4 line-clamp-2">
                  {party.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center text-blue-400">
                  <Award className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">
                    {party.votesReceived} votes
                  </span>
                </div>
                <div className="flex items-center text-white/40 text-xs">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(party.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default PartyList;
