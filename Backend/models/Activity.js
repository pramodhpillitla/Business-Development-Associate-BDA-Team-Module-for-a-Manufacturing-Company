import mongoose from "mongoose";

export const ACTIVITY_TYPES = ["call", "email", "meeting", "note"];

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Activity message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ACTIVITY_TYPES,
      default: "note",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ createdBy: 1 });
activitySchema.index({ type: 1 });

export const Activity = mongoose.model("Activity", activitySchema);
