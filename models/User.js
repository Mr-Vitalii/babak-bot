import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    chatId: { type: Number, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", userSchema);