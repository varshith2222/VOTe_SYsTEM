import mongoose from 'mongoose';
import User from '../models/User';
import PartyFlag from '../models/PartyFlag';

// Sample wallet addresses
const wallets = [
  '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  '0x8474d35Cc6634C0532925a3b844Bc454e4438f55',
  '0x952d35Cc6634C0532925a3b844Bc454e4438f66',
  '0x123d35Cc6634C0532925a3b844Bc454e4438f77',
  '0x456d35Cc6634C0532925a3b844Bc454e4438f88'
];

// Sample party data
const partyData = [
  {
    name: 'Democratic Alliance',
    symbol: 'DA',
    image: 'https://example.com/da-flag.png',
    description: 'Democratic Alliance Party Flag',
    colors: ['blue', 'white']
  },
  {
    name: 'Progressive Union',
    symbol: 'PU',
    image: 'https://example.com/pu-flag.png',
    description: 'Progressive Union Party Flag',
    colors: ['green', 'gold']
  },
  {
    name: 'Liberty Party',
    symbol: 'LP',
    image: 'https://example.com/lp-flag.png',
    description: 'Liberty Party Flag',
    colors: ['red', 'white', 'blue']
  },
  {
    name: 'National Front',
    symbol: 'NF',
    image: 'https://example.com/nf-flag.png',
    description: 'National Front Party Flag',
    colors: ['orange', 'green']
  },
  {
    name: 'Unity Coalition',
    symbol: 'UC',
    image: 'https://example.com/uc-flag.png',
    description: 'Unity Coalition Party Flag',
    colors: ['purple', 'white']
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/partyFlags');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await PartyFlag.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await Promise.all(
      wallets.map(async (wallet, index) => {
        const user = await User.create({
          walletAddress: wallet,
          username: `User${index + 1}`,
          email: `user${index + 1}@example.com`,
          createdAt: new Date(),
          lastLogin: new Date()
        });
        return user;
      })
    );
    console.log('Created users:', users.length);

    // Create party flags
    const flags = await Promise.all(
      partyData.map(async (party, index) => {
        const flag = await PartyFlag.create({
          name: party.name,
          symbol: party.symbol,
          image: party.image,
          description: party.description,
          tokenId: (index + 1).toString(),
          owner: wallets[index],
          createdAt: new Date(),
          metadata: {
            attributes: [
              {
                trait_type: 'Colors',
                value: party.colors.join(', ')
              },
              {
                trait_type: 'Year Founded',
                value: `202${index + 1}`
              },
              {
                trait_type: 'Members',
                value: Math.floor(Math.random() * 10000 + 1000).toString()
              }
            ]
          }
        });
        return flag;
      })
    );
    console.log('Created party flags:', flags.length);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
