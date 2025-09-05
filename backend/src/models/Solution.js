import mongoose from 'mongoose';

const SolutionSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true, trim: true },
  problemUrl: { type: String, default: '' },
  category: { type: String, default: '' },
  difficulty: { type: String, enum: ['easy','medium','hard','expert',''], default: '' },
  approach: { type: String, default: '' },
  code: { type: String, default: '' },
  language: { type: String, default: 'plaintext' },
  tags: { type: [String], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Optional theory/metadata
  timeComplexity: { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
  references: { type: [String], default: [] },
  related: { type: [String], default: [] },
}, { timestamps: true });

export default mongoose.model('Solution', SolutionSchema);
