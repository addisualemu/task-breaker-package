/**
 * A provider is any async function that accepts a task description
 * and a temperature (1–5) and resolves to an array of subtask strings.
 *
 * temperature 1 → fewest / broadest subtasks
 * temperature 5 → most granular subtasks
 */
export type TaskProvider = (
  task: string,
  temperature: number
) => Promise<string[]>;

/** Options accepted by breakTask(). */
export interface BreakTaskOptions {
  /** Plain-language description of the task to break down. */
  task: string;
  /**
   * Detail level: integer from 1 (coarse) to 5 (very detailed).
   * @default 3
   */
  temperature?: number;
  /**
   * Custom provider function. When omitted the built-in heuristic
   * provider is used.
   */
  provider?: TaskProvider;
}

/** Value returned by breakTask(). */
export interface BreakTaskResult {
  /** The original task string passed in. */
  task: string;
  /** Temperature value that was used. */
  temperature: number;
  /** Ordered list of subtask descriptions. */
  subtasks: string[];
}
