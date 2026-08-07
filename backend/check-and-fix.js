/**
 * Diagnostic + Fix Script
 * - Checks DB connection and data
 * - Creates an admin user you can log in with
 * - Seeds data to correct db if empty
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const SAMPLE_IMAGE = "https://res.cloudinary.com/djnfecvb6/image/upload/v1781012509/soundlink/images/yrzjhhuf4qxivbkgyr7h.jpg";
const SAMPLE_AUDIO  = "https://res.cloudinary.com/djnfecvb6/video/upload/v1781012507/soundlink/audio/qpdmbupdowuehymaaqst.mp3";
const COLORS = ["#1DB954","#e11d48","#2563eb","#d97706","#7c3aed","#0891b2","#be123c","#059669","#dc2626","#7c3aed"];

// ── Inline schemas (avoid import chain issues) ────────────────────────────────
const userSchema = new mongoose.Schema({
  username: String, email: String, password: String, role: String,
  clerkId: String, isVerified: Boolean, isEmailVerified: Boolean,
  avatar: String, resetPasswordToken: String, resetPasswordExpires: Date
}, { timestamps: true });

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true }, bio: String,
  image: String, cloudinaryId: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const albumSchema = new mongoose.Schema({
  name: { type: String, required: true }, desc: { type: String, required: true },
  bgColour: { type: String, required: true }, image: { type: String, required: true },
  artist: mongoose.Schema.Types.ObjectId, createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const songSchema = new mongoose.Schema({
  name: { type: String, required: true }, desc: String, album: String,
  image: String, file: { type: String, required: true }, duration: String,
  artist: mongoose.Schema.Types.ObjectId, lyrics: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const movieAlbumSchema = new mongoose.Schema({
  title: { type: String, required: true }, director: { type: String, required: true },
  name: String, desc: String, bgColour: String, image: String
}, { timestamps: true });

const run = async () => {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env!");
    process.exit(1);
  }

  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { dbName: "SoundLive", family: 4 });
  console.log("✅ Connected! Database:", mongoose.connection.db.databaseName);

  // Register models
  const User       = mongoose.models.user       || mongoose.model("user",       userSchema);
  const Artist     = mongoose.models.artist     || mongoose.model("artist",     artistSchema);
  const Album      = mongoose.models.album      || mongoose.model("album",      albumSchema);
  const Song       = mongoose.models.song       || mongoose.model("song",       songSchema);
  const MovieAlbum = mongoose.models.moviealbum || mongoose.model("moviealbum", movieAlbumSchema);

  // ── Diagnostics ────────────────────────────────────────────────────────────
  const [uCount, arCount, alCount, sCount, mCount] = await Promise.all([
    User.countDocuments(), Artist.countDocuments(), Album.countDocuments(),
    Song.countDocuments(), MovieAlbum.countDocuments()
  ]);
  console.log(`\n📊 Current DB State (SoundLive database):`);
  console.log(`   Users:        ${uCount}`);
  console.log(`   Artists:      ${arCount}`);
  console.log(`   Albums:       ${alCount}`);
  console.log(`   Songs:        ${sCount}`);
  console.log(`   MovieAlbums:  ${mCount}\n`);

  // ── Step 1: Create / reset admin user ─────────────────────────────────────
  console.log("👤 Setting up admin user...");
  const adminEmail = "admin@soundlink.com";
  const adminPass  = "Admin@1234";
  const hashed     = await bcrypt.hash(adminPass, 10);

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    // Force-reset password so we know it works
    existingAdmin.password = hashed;
    existingAdmin.role = "admin";
    existingAdmin.isVerified = true;
    existingAdmin.isEmailVerified = true;
    await existingAdmin.save();
    console.log("✅ Admin user password reset.");
  } else {
    await User.create({
      username: "soundlink_admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
      clerkId: `admin_${Date.now()}`,
      isVerified: true,
      isEmailVerified: true,
    });
    console.log("✅ Admin user created.");
  }

  // Also create a normal test user
  const testEmail = "user@soundlink.com";
  const testPass  = "User@1234";
  const testHash  = await bcrypt.hash(testPass, 10);
  const existingTest = await User.findOne({ email: testEmail });
  if (existingTest) {
    existingTest.password = testHash;
    existingTest.role = "user";
    await existingTest.save();
    console.log("✅ Test user password reset.");
  } else {
    await User.create({
      username: "soundlink_user",
      email: testEmail,
      password: testHash,
      role: "user",
      clerkId: `user_${Date.now()}`,
      isVerified: true,
      isEmailVerified: true,
    });
    console.log("✅ Test user created.");
  }

  // ── Step 2: Seed data if any collection is empty ──────────────────────────
  const admin = await User.findOne({ email: adminEmail });

  if (arCount === 0) {
    console.log("\n🎤 Seeding 25 artists...");
    const artistNames = [
      "Arijit Singh","Jubin Nautiyal","Atif Aslam","Kumar Sanu","Udit Narayan",
      "Taylor Swift","Ed Sheeran","The Weeknd","Dua Lipa","Billie Eilish",
      "Narayan Gopal","Hari Bansa Acharya","Amit Saigal","Bartika Eam Rai","Sabin Shrestha",
      "Neetesh Jung Kunwar","Paul Shah","Pramod Kharel","Melina Rai","Trishna Gurung",
      "Coldplay","Imagine Dragons","Linkin Park","Arctic Monkeys","Eminem"
    ];
    const artistDocs = await Artist.insertMany(
      artistNames.map(name => ({ name, bio: `${name} is a celebrated musician known for soulful melodies and chart-topping hits.`, image: SAMPLE_IMAGE, createdBy: admin._id }))
    );
    console.log(`✅ Created ${artistDocs.length} artists.`);

    console.log("\n💿 Seeding 30 albums...");
    const albumNames = [
      "Echoes of Eternity","Midnight Horizons","Soul Unlimited","Crimson Wave","Neon Dreams",
      "Monsoon Memories","Mountain Rhapsody","Golden Silence","Shattered Skies","Violet Storm",
      "The Last Symphony","Dawn Chorus","Ocean Whispers","Desert Wind","City Lights",
      "Timeless Ballads","Electric Pulse","Lunar Tide","Sakura Season","Thunder Road",
      "Himalayan Beats","Kathmandu Chronicles","Pokhara Nights","Everest Echoes","Terai Tales",
      "Fusion Frenzy","Acoustic Dreams","Jazz Café Sessions","Blues Revival","Indie Spectrum"
    ];
    const albumDocs = await Album.insertMany(
      albumNames.map((name, i) => ({
        name, desc: `A stunning collection of tracks that define ${name}. Produced with passion and precision.`,
        bgColour: COLORS[i % COLORS.length], image: SAMPLE_IMAGE,
        artist: artistDocs[i % artistDocs.length]._id, createdBy: admin._id
      }))
    );
    console.log(`✅ Created ${albumDocs.length} albums.`);

    console.log("\n🎬 Seeding 10 movie albums...");
    const movies = [
      { title: "Sherpa - The Summit Story",    director: "Jen Peedom" },
      { title: "Kagbeni",                       director: "Subarna Thapa" },
      { title: "Loot",                          director: "Nischal Basnet" },
      { title: "Darpan Chhaya",                 director: "Nabin Subba" },
      { title: "Interstellar",                  director: "Christopher Nolan" },
      { title: "Inception",                     director: "Christopher Nolan" },
      { title: "Avengers: Endgame",             director: "Anthony & Joe Russo" },
      { title: "The Dark Knight",               director: "Christopher Nolan" },
      { title: "La La Land",                    director: "Damien Chazelle" },
      { title: "Bohemian Rhapsody",             director: "Bryan Singer" },
    ];
    await MovieAlbum.insertMany(
      movies.map((m, i) => ({
        title: m.title, director: m.director,
        name: m.title, desc: `Original Soundtrack for ${m.title}`,
        bgColour: COLORS[(i + 3) % COLORS.length], image: SAMPLE_IMAGE
      }))
    );
    console.log("✅ Created 10 movie albums.");

    console.log("\n🎵 Seeding 200 songs...");
    const songTitles = [
      "Tum Hi Ho","Enna Sona","Raabta","Channa Mereya","Kal Ho Naa Ho",
      "Lag Ja Gale","Ajeeb Dastan","Phir Le Aya Dil","Abhi Na Jao","Tujhse Naraz Nahi",
      "Blinding Lights","Save Your Tears","Starboy","Die For You","After Hours",
      "Shape of You","Perfect","Castle on the Hill","Photograph","Thinking Out Loud",
      "Bad Guy","Ocean Eyes","Lovely","Bury a Friend","Wish You Were Gay",
      "Anti-Hero","Love Story","Shake It Off","Blank Space","Style",
      "Levitating","New Rules","One Kiss","Don't Start Now","Physical",
      "Watermelon Sugar","Adore You","Falling","Golden","Treat People With Kindness",
      "Mero Maya","Timrai Nimti","Sathi Rakhau La","Aaja Mero Ghar Aaja","Jhilko Timro",
      "Sajha Ko Bus","Yo Mann Ta Mero Nepal Ma Cha","Pardeshi","Gayo Dil Haari","Priyasi",
      "Nau Lakhe Tara","Resham Firiri","Malai Nasodha","Timilai Dekhera","K Cha Tero Irada",
      "Lukka Chuppi","Kabira","Ilahi","Tu Hi Hai","Manwa Laage",
      "Fix You","The Scientist","Yellow","In My Place","Clocks",
      "Demons","Radioactive","Believer","Thunder","Whatever It Takes",
      "Numb","In The End","Crawling","Somewhere I Belong","Faint",
      "Lose Yourself","Rap God","Not Afraid","Recovery","Love the Way You Lie",
      "Mr. Brightside","Somebody Told Me","Human","All These Things I Have Done","Smile",
      "Do I Wanna Know?","R U Mine?","505","Fluorescent Adolescent","Why'd You Only Call Me When You're High?",
      "Creep","Karma Police","Fake Plastic Trees","Street Spirit","No Surprises",
      "Yesterday","Let It Be","Hey Jude","Come Together","Something",
      "Smells Like Teen Spirit","Come as You Are","Lithium","Polly","The Man Who Sold the World",
      "Bohemian Rhapsody","We Will Rock You","Don't Stop Me Now","Somebody to Love","Radio Ga Ga",
      "Hotel California","Life in the Fast Lane","Desperado","Take It Easy","Lyin' Eyes",
      "Sweet Home Alabama","Free Bird","Simple Man","Tuesday's Gone","Gimme Three Steps",
      "Purple Rain","When Doves Cry","Kiss","Let's Go Crazy","Sign 'O' the Times",
      "Superstition","Isn't She Lovely","Sir Duke","Happy Birthday","You Are the Sunshine of My Life",
      "Billie Jean","Thriller","Beat It","Man in the Mirror","Rock With You",
      "Uptown Funk","Locked Out of Heaven","Treasure","Gorilla","When I Was Your Man",
      "Can't Stop the Feeling!","Cry Me a River","SexyBack","Rock Your Body","Mirrors",
      "Umbrella","Diamonds","We Found Love","Stay","FourFiveSeconds",
      "Rolling in the Deep","Hello","Someone Like You","Set Fire to the Rain","Skyfall",
      "Despacito","Shape of You remix","Cheap Thrills","Sorry","Love Yourself",
      "Old Town Road","Sunflower","Rockstar","Congratulations","Broken Clocks",
      "HUMBLE.","DNA.","LOVE.","LOYALTY.","Element.",
      "God's Plan","One Dance","Hotline Bling","Started From the Bottom","Hold On We're Going Home",
      "Stressed Out","Ride","Holding On to You","Heathens","Fairly Local",
      "Shallow","Always Remember Us This Way","I'll Never Love Again","Look What I Found","Hair Body Face",
      "Counting Stars","Apologize","Stop and Stare","Good Life","Feel Again",
      "Stitches","Treat You Better","There's Nothing Holdin' Me Back","In My Blood","Mercy",
      "Heat Waves","Your Song","Clarity","Take Me to Church","Someone You Loved",
      "Stay With Me","Latch","Lay Me Down","Restart","Nirvana"
    ];
    const songs = songTitles.map((name, i) => ({
      name, desc: artistDocs[i % artistDocs.length].name,
      album: albumDocs[i % albumDocs.length].name,
      image: SAMPLE_IMAGE, file: SAMPLE_AUDIO, duration: "3:45",
      artist: artistDocs[i % artistDocs.length]._id,
      lyrics: `[00:00.00] Intro - ${name}\n[00:15.00] Verse 1\n[00:45.00] Chorus\n[01:30.00] Verse 2\n[02:00.00] Chorus\n[02:30.00] Bridge\n[03:00.00] Outro`,
      createdBy: admin._id
    }));
    await Song.insertMany(songs);
    console.log(`✅ Created ${songs.length} songs.`);
  } else {
    console.log(`ℹ️  Data already exists (${arCount} artists, ${sCount} songs). Skipping seed.`);
  }

  // ── Final count ────────────────────────────────────────────────────────────
  const [uF, arF, alF, sF, mF] = await Promise.all([
    User.countDocuments(), Artist.countDocuments(), Album.countDocuments(),
    Song.countDocuments(), MovieAlbum.countDocuments()
  ]);

  console.log(`\n🎉 Final DB State (SoundLive database):`);
  console.log(`   Users:        ${uF}`);
  console.log(`   Artists:      ${arF}`);
  console.log(`   Albums:       ${alF}`);
  console.log(`   Songs:        ${sF}`);
  console.log(`   MovieAlbums:  ${mF}`);

  console.log("\n🔑 LOGIN CREDENTIALS:");
  console.log("   ┌────────────────────────────────────────────────┐");
  console.log("   │  Artist Login (Admin):                         │");
  console.log("   │    Email:    admin@soundlink.com               │");
  console.log("   │    Password: Admin@1234                        │");
  console.log("   │                                                │");
  console.log("   │  User Login:                                   │");
  console.log("   │    Email:    user@soundlink.com                │");
  console.log("   │    Password: User@1234                         │");
  console.log("   └────────────────────────────────────────────────┘");

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
