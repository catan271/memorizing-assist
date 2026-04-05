import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useQuiz } from "./hooks/useQuiz";
import { QuizLayout } from "./components/QuizLayout";
import { ChoiceMode } from "./components/ChoiceMode";
import { TextMode } from "./components/TextMode";
import "./styles.css";

function App() {
  const quiz = useQuiz();

  return (
    <BrowserRouter>
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
              />
            }
          />
        </Routes>
      </QuizLayout>
    </BrowserRouter>
  );
}

export default App;
