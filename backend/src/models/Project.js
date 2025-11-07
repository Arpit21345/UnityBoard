import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  members: { type: [memberSchema], default: [] },
  // when true, Discussion operates as a single-room; threads list should be limited
  chatSingleRoom: { type: Boolean, default: false },
  // password for private projects (optional, only required if visibility is 'private')
  projectPassword: { type: String }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
