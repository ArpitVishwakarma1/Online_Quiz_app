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
