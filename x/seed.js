const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const usersToSeed = [
  { username: 'sakshidk1502@gmail.com', password: 'password123' },
  { username: 'admin', password: 'password123' }
];

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/summership';
  
  console.log(`Connecting to database at ${mongoUri}...`);
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connection successful.');
    
    // Clear out existing users
    console.log('Clearing existing users from database...');
    await User.deleteMany({});
    
    // Hash passwords and save users
    for (const u of usersToSeed) {
      console.log(`Hashing password and saving user: ${u.username}`);
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const newUser = new User({
        username: u.username,
        password: hashedPassword
      });
      await newUser.save();
    }
    
    console.log('Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
