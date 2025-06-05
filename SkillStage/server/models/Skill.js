const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});
const SkillSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requests: [
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  }
]
,
  acceptedLearners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  feedbacks: [feedbackSchema]
});

module.exports = mongoose.model('Skill', SkillSchema);
