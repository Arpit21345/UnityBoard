import mongoose from 'mongoose';

const SnippetSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'plaintext' },
  tags: { type: [String], default: [] },
  notes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model('Snippet', SnippetSchema);
