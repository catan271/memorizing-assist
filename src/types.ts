import type { PlantRecord } from "./data";

export type FieldKey = keyof Omit<PlantRecord, "id">;

export type MappingStat = {
  seen: number;
  correct: number;
  wrong: number;
  wrongBoost: number;
};

export type Question = {
  key: string;
  sourceField: FieldKey;
  targetField: FieldKey;
  prompt: string;
  answer: string;
  choices: string[];
};
