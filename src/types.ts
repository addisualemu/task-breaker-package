/**
 * A provider is any async function that accepts a task description
 * and a temperature (1–5) and resolves to an array of subtasks.
 *
 * temperature 1 → fewest / broadest subtasks
 * temperature 5 → most granular subtasks
 */
export interface Task {
  taskName: string;
  subtasks: Task[];
}

export type TaskLike = string | Task;
export type TaskPath = number[];

export type TaskProvider = (
  task: string,
  temperature: number
) => Promise<TaskLike[]>;

/** Options accepted by breakTask(). */
export interface BreakTaskOptions {
  /** Task to break down, either as plain text or an existing recursive task tree. */
  task: TaskLike;
  /**
   * Detail level: integer from 1 (coarse) to 5 (very detailed).
   * @default 3
   */
  temperature?: number;
  /**
   * Optional 1-based path to the subtask to expand.
   * Example: [3, 5, 2] targets the 2nd subtask of the 5th subtask of the 3rd root subtask.
   */
  selectedSubtask?: TaskPath;
  /**
   * Custom provider function. When omitted the built-in heuristic
   * provider is used.
   */
  provider?: TaskProvider;
}

/** Value returned by breakTask(). */
export interface BreakTaskResult {
  /** The original task, normalised into the recursive Task shape. */
  task: Task;
  /** Temperature value that was used. */
  temperature: number;
  /** Ordered list of normalised subtasks. */
  subtasks: Task[];
}
