import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Thread', ThreadSchema);
