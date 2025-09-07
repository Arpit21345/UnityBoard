import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  meta: { type: Object },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
