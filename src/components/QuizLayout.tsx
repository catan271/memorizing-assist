import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { fieldLabels } from "../lib/quiz";
import type { useQuiz } from "../hooks/useQuiz";

type QuizLayoutProps = {
  quiz: ReturnType<typeof useQuiz>;
  children: ReactNode;
};

export function QuizLayout({ quiz, children }: QuizLayoutProps) {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-top">
          <div>
            <p className="eyebrow">Latin Memory Drill</p>
            <h1>Ôn ánh xạ giữa các cột</h1>
          </div>
          <button className="ghost-button" onClick={quiz.resetProgress} type="button">
            Reset
          </button>
        </div>

        <nav className="mode-tabs" aria-label="Chế độ luyện tập">
          <NavLink
            to="/choices"
            className={({ isActive }) => `mode-tab${isActive ? " active" : ""}`}
          >
            Chọn đáp án
          </NavLink>
          <NavLink to="/text" className={({ isActive }) => `mode-tab${isActive ? " active" : ""}`}>
            Nhập text
          </NavLink>
        </nav>

        <div className="stats-grid">
          <article>
            <span>Lần trả lời</span>
            <strong>{quiz.totalSeen}</strong>
          </article>
          <article>
            <span>Độ chính xác</span>
            <strong>{quiz.accuracy}%</strong>
          </article>
          <article>
            <span>Câu sai</span>
            <strong>{quiz.totalWrong}</strong>
          </article>
        </div>

        <div className="question-card">
          <div className="question-meta">
            <span>
              {fieldLabels[quiz.question.sourceField]}
              {" -> "}
              {fieldLabels[quiz.question.targetField]}
            </span>
            <span>Trọng số: {quiz.statWeight.toFixed(1)}</span>
          </div>

          <div className="prompt-block">
            <p className="prompt-label">{fieldLabels[quiz.question.sourceField]}</p>
            <p className="prompt-value">{quiz.question.prompt}</p>
          </div>

          {children}

          <div className="feedback-row">
            <span className={quiz.lastResult === "correct" ? "feedback good" : "feedback"}>
              {quiz.lastResult === "correct" ? "Đúng, câu này vẫn sẽ quay lại nhưng ít hơn." : ""}
            </span>
            <span className={quiz.lastResult === "wrong" ? "feedback bad" : "feedback"}>
              {quiz.lastResult === "wrong" ? `Sai, đáp án đúng là: ${quiz.question.answer}` : ""}
            </span>
          </div>
        </div>
      </section>

      <section className="bottom-panel">
        <article className="info-card">
          <h2>Cách lặp câu hỏi</h2>
          <p>
            Mọi ánh xạ đều luôn nằm trong vòng ôn tập. Câu sai được tăng trọng số nên sẽ xuất hiện
            lại sớm hơn, còn câu đúng chỉ giảm dần độ ưu tiên chứ không bị loại khỏi bộ câu hỏi.
          </p>
        </article>

        <article className="info-card">
          <h2>Ánh xạ cần chú ý</h2>
          <div className="hot-list">
            {quiz.hotMappings.map((item) => (
              <div className="hot-item" key={item.key}>
                <strong>
                  {fieldLabels[item.sourceField]}
                  {" -> "}
                  {fieldLabels[item.targetField]}
                </strong>
                <span>{item.prompt}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
