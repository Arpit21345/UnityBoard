import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String },
  analytics: {
    totalProjectsCreated: { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
    totalContributions: { type: Number, default: 0 },
    lifetimeSolutions: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
