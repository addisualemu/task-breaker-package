import { breakTask } from "./breakTask.js";
import type { BreakTaskResult } from "./types.js";
import { aiProvider } from "./aiProvider.js";

export interface BreakTaskWithAiOptions {
  task: string;
  temperature?: number;
}

/**
 * Convenience wrapper that uses the package AI provider.
 *
 * Environment is read from process.env using package-defined names:
 * - TASK_BREAKER_API_URL
 * - TASK_BREAKER_API_KEY
 * - TASK_BREAKER_MODEL
 */
export async function breakTaskWithAi(
  options: BreakTaskWithAiOptions
): Promise<BreakTaskResult> {
  return breakTask({
    task: options.task,
    temperature: options.temperature,
    provider: aiProvider,
  });
}
