import mongoose from "mongoose";

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    contactInfo: {
      type: String,
      required: [true, "Contact info is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
    },
    dealValue: {
      type: Number,
      default: 0,
      min: [0, "Deal value cannot be negative"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ createdBy: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: "text", company: "text", contactInfo: "text" });

export const Lead = mongoose.model("Lead", leadSchema);
