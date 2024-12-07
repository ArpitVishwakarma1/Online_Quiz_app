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
