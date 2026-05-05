import { defaultProvider } from "./defaultProvider.js";
import type { BreakTaskOptions, BreakTaskResult } from "./types.js";

const MIN_TEMPERATURE = 1;
const MAX_TEMPERATURE = 5;
const DEFAULT_TEMPERATURE = 3;

/**
 * Breaks a task into an ordered list of subtasks.
 *
 * @param options.task        - Description of the task to break down.
 * @param options.temperature - Detail level 1–5 (default 3).
 *                              1 = fewest/broadest, 5 = most granular.
 * @param options.provider    - Optional custom provider. Defaults to the
 *                              built-in heuristic provider.
 *
 * @example
 * const result = await breakTask({ task: "build dog house", temperature: 2 });
 * // result.subtasks → ["Plan the design", "Buy materials", "Build the structure", "Finish and paint"]
 */
export async function breakTask(
  options: BreakTaskOptions
): Promise<BreakTaskResult> {
  const { task, provider = defaultProvider } = options;

  if (!task || task.trim().length === 0) {
    throw new TypeError("task must be a non-empty string");
  }

  const rawTemp = options.temperature ?? DEFAULT_TEMPERATURE;

  if (
    !Number.isInteger(rawTemp) ||
    rawTemp < MIN_TEMPERATURE ||
    rawTemp > MAX_TEMPERATURE
  ) {
    throw new RangeError(
      `temperature must be an integer between ${MIN_TEMPERATURE} and ${MAX_TEMPERATURE}, received: ${rawTemp}`
    );
  }

  const subtasks = await provider(task.trim(), rawTemp);

  return {
    task: task.trim(),
    temperature: rawTemp,
    subtasks,
  };
}
