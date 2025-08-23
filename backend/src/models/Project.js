import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'member'], default: 'member' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  allowMemberInvites: { type: Boolean, default: false },
  chatSingleRoom: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  members: { type: [memberSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
