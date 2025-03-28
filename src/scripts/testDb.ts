import connectDB from '../config/db';
import User from '../models/User';

async function testConnection() {
  try {
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test creating a user
    const testUser = await User.create({
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: 'TestUser',
      email: 'test@example.com'
    });
    console.log('✅ Test user created:', testUser);

    // Clean up test data
    await User.deleteOne({ _id: testUser._id });
    console.log('✅ Test cleanup successful');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

testConnection();
