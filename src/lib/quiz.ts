import { plantRecords, type PlantRecord } from "../data";
import type { FieldKey, MappingStat, Question } from "../types";

export const STORAGE_KEY = "latin-flashcard-progress-v1";
export const DATA_VERSION = "2026-04-05-family-merged-v1";

type StoredProgress = {
  dataVersion: string;
  stats: Record<string, MappingStat>;
};

export const fieldLabels: Record<FieldKey, string> = {
  common: "Tên thường dùng",
  scientific: "Tên khoa học",
  family: "Họ",
};

const fieldOrder: FieldKey[] = ["common", "scientific", "family"];

export const defaultStats = (): MappingStat => ({
  seen: 0,
  correct: 0,
  wrong: 0,
  wrongBoost: 0,
});

export const cleanValue = (value: string) => value.replace(/\s+/g, " ").trim();

export const normalizeForCompare = (value: string) =>
  cleanValue(value)
    .toLocaleLowerCase("vi-VN")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export const shuffle = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
};

export const weightedPick = <T,>(items: T[], getWeight: (item: T) => number): T => {
  const weightedTotal = items.reduce((sum, item) => sum + getWeight(item), 0);
  let cursor = Math.random() * weightedTotal;

  for (const item of items) {
    cursor -= getWeight(item);
    if (cursor <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
};

export const buildQuestionPool = (records: PlantRecord[]) => {
  const questions: Question[] = [];

  for (const record of records) {
    const usableFields = fieldOrder.filter((field) => cleanValue(record[field]).length > 0);

    for (const sourceField of usableFields) {
      if (sourceField === "family") {
        continue;
      }

      for (const targetField of usableFields) {
        if (sourceField === targetField) {
          continue;
        }

        const answer = cleanValue(record[targetField]);
        const distractors = shuffle(
          [...new Set(records.map((item) => cleanValue(item[targetField])))].filter(
            (value) => value && value !== answer,
          ),
        ).slice(0, 3);

        questions.push({
          key: `${record.id}:${sourceField}->${targetField}`,
          sourceField,
          targetField,
          prompt: cleanValue(record[sourceField]),
          answer,
          choices: shuffle([answer, ...distractors]),
        });
      }
    }
  }

  return questions;
};

export const allQuestions = buildQuestionPool(plantRecords);

export const readStoredStats = (): Record<string, MappingStat> => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || !("dataVersion" in parsed) || !("stats" in parsed)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }

    const payload = parsed as StoredProgress;

    if (payload.dataVersion !== DATA_VERSION) {
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }

    return payload.stats ?? {};
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return {};
  }
};

export const writeStoredStats = (stats: Record<string, MappingStat>) => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredProgress = {
    dataVersion: DATA_VERSION,
    stats,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const statWeight = (stat?: MappingStat) => {
  const baseWeight = 1;
  const wrongWeight = (stat?.wrong ?? 0) * 2.2;
  const boostWeight = (stat?.wrongBoost ?? 0) * 3;
  return baseWeight + wrongWeight + boostWeight;
};
