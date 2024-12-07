# Online Quiz App

## Description
A full-stack quiz application allowing users to take quizzes, view results, and check the leaderboard.

## Features
- Timed quizzes with multiple-choice questions.
- Real-time score updates.
- Leaderboards for competition.

## Setup
1. Clone the repository.
2. Navigate to `backend` and run:


Here’s the systematic implementation for your Online Quiz App that includes both frontend and backend code, structured for submission in a GitHub repository.

Project Structure
java
Copy code
online-quiz-app/
├── backend/
│   ├── models/
│   │   └── Quiz.js
│   ├── routes/
│   │   └── quizRoutes.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuizScreen.js
│   │   │   ├── ResultsScreen.js
│   │   └── App.js
│   └── package.json
└── README.md
Backend Code
1. package.json
json
Copy code
{
  "name": "quiz-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.1.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5"
  }
}
2. models/Quiz.js
javascript
Copy code
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
3. routes/quizRoutes.js
javascript
Copy code
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
4. server.js
javascript
Copy code
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const quizRoutes = require('./routes/quizRoutes');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api', quizRoutes);

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/quiz-app', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error(error));

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
Frontend Code
1. package.json
json
Copy code
{
  "name": "quiz-frontend",
  "version": "1.0.0",
  "dependencies": {
    "axios": "^1.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}
2. src/components/QuizScreen.js
javascript
Copy code
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuizScreen = () => {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/quizzes').then((response) => {
      setQuiz(response.data[0]); // Load the first quiz
    });
  }, []);

  const handleSubmit = () => {
    axios
      .post(`http://localhost:5000/api/quizzes/${quiz._id}/submit`, { userId: 'User1', answers })
      .then((response) => {
        setResult(response.data);
        setSubmitted(true);
      });
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div>
      <h1>{quiz.title}</h1>
      {quiz.questions.map((q, index) => (
        <div key={index}>
          <p>{q.question}</p>
          {q.options.map((option, i) => (
            <label key={i}>
              <input
                type="radio"
                name={`question-${index}`}
                value={option}
                onChange={() => setAnswers({ ...answers, [index]: option })}
              />
              {option}
            </label>
          ))}
        </div>
      ))}
      {!submitted && <button onClick={handleSubmit}>Submit</button>}
      {submitted && result && (
        <div>
          <h2>Score: {result.score}</h2>
          <pre>{JSON.stringify(result.correctAnswers, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
3. src/components/ResultsScreen.js
javascript
Copy code
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ResultsScreen = ({ quizId }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/quizzes/${quizId}/leaderboard`).then((response) => {
      setLeaderboard(response.data.leaderboard);
    });
  }, [quizId]);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ul>
        {leaderboard.map((entry, index) => (
          <li key={index}>
            {entry.user}: {entry.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultsScreen;
4. src/App.js
javascript
Copy code
import React from 'react';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';

const App = () => {
  return (
    <div>
      <QuizScreen />
      <ResultsScreen quizId="YourQuizIdHere" />
    </div>
  );
};

export default App;
README.md
markdown
Copy code
# Online Quiz App

## Description
A full-stack quiz application allowing users to take quizzes, view results, and check the leaderboard.

## Features
- Timed quizzes with multiple-choice questions.
- Real-time score updates.
- Leaderboards for competition.

## Setup
1. Clone the repository.
2. Navigate to `backend` and run:
npm install npm run dev

markdown
3. Navigate to `frontend` and run:
npm install npm start

markdown

## Tech Stack
- **Frontend**: React, Axios
- **Backend**: Node.js, Express, MongoDB
