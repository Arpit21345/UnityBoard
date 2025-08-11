import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  code: { type: String, index: true },
  token: { type: String, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['member','admin'], default: 'member' },
  expiresAt: { type: Date },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  enabled: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Invitation || mongoose.model('Invitation', invitationSchema);
