/**
 * Run this script ONCE to make your account an admin:
 *   node make-admin.js your@email.com
 * 
 * Usage from the backend directory:
 *   node make-admin.js herexgf@gmail.com
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node make-admin.js <email>');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  username: String,
}, { strict: false });

const User = mongoose.model('user', userSchema);

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      console.log('All users:');
      const all = await User.find({}, 'email username role');
      all.forEach(u => console.log(` - ${u.email} | ${u.username} | role: ${u.role}`));
      process.exit(1);
    }

    user.role = 'admin';
    await user.save();
    console.log(`✅ SUCCESS: ${user.username} (${user.email}) is now an ADMIN`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

makeAdmin();
