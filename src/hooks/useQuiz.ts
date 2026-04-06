import { useEffect, useMemo, useRef, useState } from "react";
import type { MappingStat, Question } from "../types";
import {
  allQuestions,
  defaultStats,
  normalizeForCompare,
  readStoredStats,
  statWeight,
  weightedPick,
  writeStoredStats,
  STORAGE_KEY,
} from "../lib/quiz";

type QuizMode = "choices" | "text";

export function useQuiz(mode: QuizMode) {
  const [stats, setStats] = useState<Record<string, MappingStat>>(() => readStoredStats());
  const [question, setQuestion] = useState<Question>(() =>
    weightedPick(allQuestions, (item) => statWeight(readStoredStats()[item.key])),
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<"correct" | "wrong" | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    writeStoredStats(stats);
  }, [stats]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mode === "text" && timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [mode]);

  const totalSeen = useMemo(
    () => Object.values(stats).reduce((sum, item) => sum + item.seen, 0),
    [stats],
  );
  const totalCorrect = useMemo(
    () => Object.values(stats).reduce((sum, item) => sum + item.correct, 0),
    [stats],
  );
  const totalWrong = useMemo(
    () => Object.values(stats).reduce((sum, item) => sum + item.wrong, 0),
    [stats],
  );
  const accuracy = totalSeen ? Math.round((totalCorrect / totalSeen) * 100) : 0;
  const hotMappings = useMemo(
    () =>
      [...allQuestions]
        .sort((left, right) => statWeight(stats[right.key]) - statWeight(stats[left.key]))
        .slice(0, 3),
    [stats],
  );

  const moveNext = (nextStats: Record<string, MappingStat>) => {
    const nextQuestion = weightedPick(allQuestions, (item) => statWeight(nextStats[item.key]));
    setQuestion(nextQuestion);
    setSelectedAnswer(null);
    setLastResult(null);
  };

  const queueNext = (nextStats: Record<string, MappingStat>) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      moveNext(nextStats);
    }, 850);
  };

  const registerAnswer = (isCorrect: boolean, submittedAnswer: string) => {
    if (selectedAnswer) {
      return;
    }

    setSelectedAnswer(submittedAnswer);
    setLastResult(isCorrect ? "correct" : "wrong");

    setStats((current) => {
      const currentStat = current[question.key] ?? defaultStats();
      const nextStat: MappingStat = {
        seen: currentStat.seen + 1,
        correct: currentStat.correct + (isCorrect ? 1 : 0),
        wrong: currentStat.wrong + (isCorrect ? 0 : 1),
        wrongBoost: isCorrect ? Math.max(currentStat.wrongBoost - 1, 0) : currentStat.wrongBoost + 2,
      };

      const nextStats = {
        ...current,
        [question.key]: nextStat,
      };

      if (mode === "choices") {
        queueNext(nextStats);
      }
      return nextStats;
    });
  };

  const answerChoice = (choice: string) => {
    registerAnswer(choice === question.answer, choice);
  };

  const answerUnknown = () => {
    registerAnswer(false, "Không biết");
  };

  const submitTextAnswer = (value: string) => {
    const isCorrect = normalizeForCompare(value) === normalizeForCompare(question.answer);
    registerAnswer(isCorrect, value);
  };

  const nextQuestion = () => {
    moveNext(stats);
  };

  const resetProgress = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStats({});
    setSelectedAnswer(null);
    setLastResult(null);
    setQuestion(weightedPick(allQuestions, () => 1));
    window.localStorage.removeItem(STORAGE_KEY);
  };

  return {
    accuracy,
    answerChoice,
    answerUnknown,
    hotMappings,
    lastResult,
    question,
    resetProgress,
    selectedAnswer,
    statWeight: statWeight(stats[question.key] ?? defaultStats()),
    submitTextAnswer,
    nextQuestion,
    totalSeen,
    totalWrong,
  };
}
