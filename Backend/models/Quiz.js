const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: { type: [String], required: true },
      answer: { type: String, required: true }
    }
  ],
  leaderboard: [
    {
      user: { type: String },
      score: { type: Number }
    }
  ]
});

module.exports = mongoose.model('Quiz', QuizSchema);
