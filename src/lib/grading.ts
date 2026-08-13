import type { TaskData, AnswerData } from "./tasks";

export function gradeMatching(
  data: Extract<TaskData, { kind: "MATCHING" }>,
  given: { term: string; translation: string }[],
): boolean {
  if (given.length !== data.pairs.length) return false;
  return data.pairs.every((pair) =>
    given.some((g) => g.term === pair.term && g.translation === pair.translation),
  );
}

export function gradeFillBlank(
  data: Extract<TaskData, { kind: "FILL_BLANK" }>,
  chosenOption: string,
): boolean {
  return chosenOption === data.correctOption;
}

export function gradeMultipleChoice(
  data: Extract<TaskData, { kind: "MULTIPLE_CHOICE" }>,
  chosenIndex: number,
): boolean {
  return chosenIndex === data.correctIndex;
}

/** Grades any non-CODE task kind given its data and the student's answer. */
export function gradeAnswer(data: TaskData, answer: AnswerData): boolean {
  if (data.kind === "MATCHING" && answer.kind === "MATCHING") {
    return gradeMatching(data, answer.given);
  }
  if (data.kind === "FILL_BLANK" && answer.kind === "FILL_BLANK") {
    return gradeFillBlank(data, answer.chosenOption);
  }
  if (data.kind === "MULTIPLE_CHOICE" && answer.kind === "MULTIPLE_CHOICE") {
    return gradeMultipleChoice(data, answer.chosenIndex);
  }
  return false;
}
