const express = require('express');
const Quiz = require('../models/Quiz');
const router = express.Router();

// Add a new quiz
router.post('/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit quiz answers
router.post('/quizzes/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, answers } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    const correctAnswers = {};
    const explanations = {};

    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.answer) score++;
      correctAnswers[index] = q.answer;
      explanations[index] = `Correct answer is ${q.answer}`;
    });

    quiz.leaderboard.push({ user: userId, score });
    await quiz.save();

    res.json({ score, correctAnswers, explanations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leaderboard
router.get('/quizzes/:id/leaderboard', async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const leaderboard = quiz.leaderboard.sort((a, b) => b.score - a.score);
    res.json({ leaderboard });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
