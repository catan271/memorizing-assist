import type { Question } from "../types";

type ChoiceModeProps = {
  question: Question;
  selectedAnswer: string | null;
  onAnswer: (value: string) => void;
  onSkip: () => void;
};

export function ChoiceMode({
  question,
  selectedAnswer,
  onAnswer,
  onSkip,
}: ChoiceModeProps) {
  return (
    <div className="answer-grid">
      {question.choices.map((choice) => {
        const isRight = choice === question.answer;
        const isChosen = choice === selectedAnswer;
        const classes = [
          "answer-button",
          isChosen ? "selected" : "",
          selectedAnswer && isRight ? "correct" : "",
          selectedAnswer && isChosen && !isRight ? "wrong" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={`${question.key}:${choice}`}
            className={classes}
            onClick={() => onAnswer(choice)}
            type="button"
            disabled={Boolean(selectedAnswer)}
          >
            {choice}
          </button>
        );
      })}

      <button
        className={`answer-button answer-button-unknown${selectedAnswer === "Không biết" ? " wrong selected" : ""}`}
        onClick={onSkip}
        type="button"
        disabled={Boolean(selectedAnswer)}
      >
        Không biết
      </button>
    </div>
  );
}
