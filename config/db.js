const mongoose = require('mongoose');
const { MONODB_URL } = require('./config');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
