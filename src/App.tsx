import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useQuiz } from './hooks/useQuiz';
import { QuizLayout } from './components/QuizLayout';
import { ChoiceMode } from './components/ChoiceMode';
import { TextMode } from './components/TextMode';
import './styles.css';

function AppRoutes() {
  const location = useLocation();
  const mode = location.pathname === '/text' ? 'text' : 'choices';
  const quiz = useQuiz(mode);

  return (
    <QuizLayout quiz={quiz}>
      <Routes>
        <Route path="/" element={<Navigate to="/choices" replace />} />
        <Route
          path="/choices"
          element={
            <ChoiceMode
              question={quiz.question}
              selectedAnswer={quiz.selectedAnswer}
              onAnswer={quiz.answerChoice}
              onSkip={quiz.answerUnknown}
            />
          }
        />
        <Route
          path="/text"
          element={
            <TextMode
              question={quiz.question}
              selectedAnswer={quiz.selectedAnswer}
              onSubmit={quiz.submitTextAnswer}
              onNext={quiz.nextQuestion}
            />
          }
        />
      </Routes>
    </QuizLayout>
  );
}

function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}

export default App;
