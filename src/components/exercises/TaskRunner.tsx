import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import type { TaskData } from "@/lib/tasks";
import { CodeTask } from "./CodeTask";
import { MatchingTask } from "./MatchingTask";
import { FillBlankTask } from "./FillBlankTask";
import { MultipleChoiceTask } from "./MultipleChoiceTask";

export function TaskRunner({
  taskId,
  title,
  prompt,
  data,
  maxAttempts,
  attemptsUsed,
  index,
}: {
  taskId: string;
  title: string;
  prompt: string;
  data: TaskData;
  maxAttempts: number | null;
  attemptsUsed: number;
  index: number;
}) {
  return (
    <div className="space-y-4 rounded-3xl border-2 border-primary-soft bg-white p-6">
      <h3 className="font-heading text-lg font-bold text-ink">
        {title || `Задание ${index + 1}`}
      </h3>
      {prompt && (
        <div className="text-sm">
          <MarkdownRenderer content={prompt} />
        </div>
      )}

      {data.kind === "CODE" && (
        <CodeTask taskId={taskId} data={data} maxAttempts={maxAttempts} attemptsUsed={attemptsUsed} />
      )}
      {data.kind === "MATCHING" && (
        <MatchingTask taskId={taskId} data={data} maxAttempts={maxAttempts} attemptsUsed={attemptsUsed} />
      )}
      {data.kind === "FILL_BLANK" && (
        <FillBlankTask taskId={taskId} data={data} maxAttempts={maxAttempts} attemptsUsed={attemptsUsed} />
      )}
      {data.kind === "MULTIPLE_CHOICE" && (
        <MultipleChoiceTask taskId={taskId} data={data} maxAttempts={maxAttempts} attemptsUsed={attemptsUsed} />
      )}
    </div>
  );
}
