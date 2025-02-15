import mongoose from "mongoose";

const cronTaskSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    messageIndex: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export const CronTask = mongoose.model("CronTask", cronTaskSchema);