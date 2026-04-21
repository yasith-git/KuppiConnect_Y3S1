/**
 * One-time migration: clear old file-path images from LandingAnnouncement records.
 *
 * Before the base64 fix, images were stored as relative file paths like
 * "uploads/announcements/1234567-image.jpg". These files only exist on the
 * machine that uploaded them, so they appear as broken images on every other
 * machine.  This script sets those fields to null so the UI shows the clean
 * letter-avatar fallback instead of a broken image icon.
 *
 * Records that already store a base64 data-URL (data:image/...) are untouched.
 *
 * Usage:
 *   node migrate-clear-broken-images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

async function run() {
  await mongoose.connect(process.env.MONGO_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  });
  console.log('Connected to MongoDB');

  const LandingAnnouncement = require('./src/models/LandingAnnouncement');

  // Find all records with a non-null image that is NOT a base64 data URL
  const result = await LandingAnnouncement.updateMany(
    {
      image: { $nin: [null, ''] },
      $expr: { $not: { $regexMatch: { input: '$image', regex: '^data:' } } },
    },
    { $set: { image: null } }
  );

  console.log(`Updated ${result.modifiedCount} announcement(s) — broken file-path images cleared.`);
  await mongoose.disconnect();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
