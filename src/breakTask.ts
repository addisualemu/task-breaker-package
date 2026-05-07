import { defaultProvider } from "./defaultProvider.js";
import type {
  BreakTaskOptions,
  BreakTaskResult,
  Task,
  TaskLike,
  TaskPath,
} from "./types.js";

const MIN_TEMPERATURE = 1;
const MAX_TEMPERATURE = 5;
const DEFAULT_TEMPERATURE = 3;

function isTask(value: TaskLike): value is Task {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.taskName === "string" &&
    Array.isArray(value.subtasks)
  );
}

function toTask(value: TaskLike): Task {
  if (typeof value === "string") {
    return {
      taskName: value,
      subtasks: [],
    };
  }

  if (!isTask(value)) {
    throw new TypeError("provider must resolve to an array of strings or Task objects");
  }

  return {
    taskName: value.taskName,
    subtasks: value.subtasks.map(toTask),
  };
}

function normalizeTask(task: TaskLike): Task {
  return typeof task === "string"
    ? {
        taskName: task,
        subtasks: [],
      }
    : toTask(task);
}

function assertValidTaskName(taskName: string): void {
  if (taskName.trim().length === 0) {
    throw new TypeError("task must be a non-empty string");
  }
}

function normalizeTaskTree(task: Task): Task {
  const taskName = task.taskName.trim();
  assertValidTaskName(taskName);

  return {
    taskName,
    subtasks: task.subtasks.map(normalizeTaskTree),
  };
}

function validateSelectedSubtask(path: TaskPath | undefined): TaskPath {
  if (path === undefined) {
    return [];
  }

  if (!Array.isArray(path)) {
    throw new TypeError("selectedSubtask must be an array of positive integers");
  }

  if (path.length === 0) {
    throw new RangeError("selectedSubtask must not be empty when provided");
  }

  path.forEach((segment) => {
    if (!Number.isInteger(segment) || segment < 1) {
      throw new RangeError("selectedSubtask must contain only positive integers");
    }
  });

  return [...path];
}

function getTargetTask(task: Task, path: TaskPath): Task {
  let current = task;

  path.forEach((segment, depth) => {
    const index = segment - 1;
    const next = current.subtasks[index];

    if (!next) {
      throw new RangeError(
        `selectedSubtask path is out of range at depth ${depth + 1}: ${segment}`
      );
    }

    current = next;
  });

  return current;
}

function replaceSubtasksAtPath(task: Task, path: TaskPath, subtasks: Task[]): Task {
  if (path.length === 0) {
    return {
      taskName: task.taskName,
      subtasks,
    };
  }

  const [segment, ...rest] = path;
  const index = segment - 1;

  return {
    taskName: task.taskName,
    subtasks: task.subtasks.map((subtask, subtaskIndex) =>
      subtaskIndex === index
        ? replaceSubtasksAtPath(subtask, rest, subtasks)
        : subtask
    ),
  };
}

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
  const selectedSubtask = validateSelectedSubtask(options.selectedSubtask);
  const normalizedTask = normalizeTaskTree(normalizeTask(task));

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

  const targetTask = getTargetTask(normalizedTask, selectedSubtask);
  const subtasks = (await provider(targetTask.taskName, rawTemp)).map(toTask);
  const updatedTask = replaceSubtasksAtPath(normalizedTask, selectedSubtask, subtasks);

  return {
    task: updatedTask,
    temperature: rawTemp,
    subtasks: updatedTask.subtasks,
  };
}
