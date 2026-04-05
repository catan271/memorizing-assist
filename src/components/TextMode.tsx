import { useEffect, useState } from "react";
import type { Question } from "../types";

type TextModeProps = {
  question: Question;
  selectedAnswer: string | null;
  onSubmit: (value: string) => void;
};

export function TextMode({ question, selectedAnswer, onSubmit }: TextModeProps) {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setDraft("");
  }, [question.key]);

  const isLocked = Boolean(selectedAnswer);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim() || isLocked) {
      return;
    }
    onSubmit(draft);
  };

  return (
    <form className="text-answer-form" onSubmit={handleSubmit}>
      <label className="text-answer-label" htmlFor="text-answer">
        Nhập đáp án
      </label>
      <input
        id="text-answer"
        className="text-answer-input"
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Không phân biệt hoa thường, bỏ qua dấu câu"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        disabled={isLocked}
      />
      <button className="submit-button" type="submit" disabled={isLocked || !draft.trim()}>
        Kiểm tra
      </button>
      <p className="text-mode-note">
        So khớp bỏ qua khác biệt về hoa thường, dấu câu và khoảng trắng thừa.
      </p>
    </form>
  );
}
