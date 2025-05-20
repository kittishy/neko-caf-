import { Schema } from "mongoose";
import { p } from "../utils.js";

export const ticketSchema = new Schema(
  {
    guildId: p.string,
    channelId: p.string,
    userId: p.string,
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: null },
    category: p.string,
    status: { type: String, enum: ["open", "closed", "pending"], default: "open" },
    subject: p.string,
    lastActivity: { type: Date, default: Date.now },
    messages: [{
      userId: p.string,
      content: p.string,
      timestamp: { type: Date, default: Date.now },
      attachments: [{ url: p.string, name: p.string }]
    }],
    transcriptUrl: { type: String, default: null },
    autoCloseWarned: { type: Boolean, default: false },
    reopenCount: { type: Number, default: 0 },
    tags: [p.string]
  },
  { timestamps: true }
);