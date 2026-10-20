const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const User = require("./models/User");
const Message = require("./models/Message");

const seedInitialUsers = async () => {
  try {
    let user1 = await User.findOne({ email: "alex@chat.com" });
    let user2 = await User.findOne({ email: "sarah@chat.com" });

    if (!user1) {
      user1 = new User({
        username: "alex",
        profilename: "Alex Morgan",
        email: "alex@chat.com",
        password: "password123",
      });
      await user1.save();
      console.log("👤 Created demo user: alex@chat.com / password123");
    }

    if (!user2) {
      user2 = new User({
        username: "sarah",
        profilename: "Sarah Connor",
        email: "sarah@chat.com",
        password: "password123",
      });
      await user2.save();
      console.log("👤 Created demo user: sarah@chat.com / password123");
    }

    let updated = false;
    if (!user1.friends.includes(user2._id)) {
      user1.friends.push(user2._id);
      updated = true;
    }
    if (!user2.friends.includes(user1._id)) {
      user2.friends.push(user1._id);
      updated = true;
    }
    if (updated) {
      await Promise.all([user1.save(), user2.save()]);
      console.log("🤝 Connected Alex & Sarah as mutual friends");
    }

    const messageExists = await Message.findOne({
      $or: [
        { sender: user1._id, receiver: user2._id },
        { sender: user2._id, receiver: user1._id },
      ],
    });

    if (!messageExists) {
      const initialMessage = new Message({
        sender: user1._id,
        receiver: user2._id,
        text: "Hey Sarah! Welcome to PulseChat 👋",
        attachments: [],
      });
      await initialMessage.save();
      console.log("💬 Seeded sample direct message between users");
    }
  } catch (err) {
    console.error("Error seeding initial users:", err);
  }
};

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      try {
        await mongoose.connect(process.env.MONGO_URI, {
          serverSelectionTimeoutMS: 2000,
        });
        console.log("✅ MongoDB Connected to:", process.env.MONGO_URI);
        await seedInitialUsers();
        return;
      } catch (err) {
        console.log("Local MongoDB not reachable, starting in-memory database fallback...");
      }
    }

    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongoServer = await MongoMemoryServer.create({
      binary: {
        version: "7.0.24",
      },
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("✅ In-Memory MongoDB Connected at:", uri);
    await seedInitialUsers();
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

module.exports = connectDB;
