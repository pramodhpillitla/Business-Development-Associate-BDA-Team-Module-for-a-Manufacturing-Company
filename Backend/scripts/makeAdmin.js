import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = process.argv[2];
    if (!email) {
      console.error("Please provide the email address of the user to upgrade.");
      console.log("Usage: node scripts/makeAdmin.js <user-email>");
      process.exit(1);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`Successfully upgraded user ${user.name} (${user.email}) to Admin role.`);
    process.exit(0);
  } catch (error) {
    console.error("Error upgrading user:", error);
    process.exit(1);
  }
};

makeAdmin();
