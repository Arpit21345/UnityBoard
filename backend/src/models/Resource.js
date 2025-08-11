import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, enum: ['file', 'link'], required: true },
  title: { type: String, trim: true },
  url: { type: String, required: true },
  provider: { type: String, enum: ['local', 'cloudinary', 'external'], default: 'local' },
  mime: { type: String },
  size: { type: Number },
  name: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Resource', resourceSchema);
