# task-breaker

> Break any task into an ordered list of subtasks with configurable detail level.

## Features

- **Temperature 1–5** — controls how granular the breakdown is (1 = coarse, 5 = very detailed).
- **Pluggable provider** — drop in your own AI or custom logic; ships with a built-in heuristic provider.
- **Dual module** — works in both ESM and CommonJS environments.
- **Fully typed** — first-class TypeScript support with exported types.

---

## Installation

```bash
npm install task-breaker
```

---

## Quick start

```ts
import { breakTask } from "task-breaker";

const result = await breakTask({
  task: { taskName: "build dog house", subtasks: [] },
  temperature: 2,
});
console.log(result.subtasks);
// → [
//   { taskName: "Plan the design", subtasks: [] },
//   { taskName: "Buy materials", subtasks: [] },
//   { taskName: "Build the structure", subtasks: [] },
//   { taskName: "Finish and paint", subtasks: [] }
// ]
```

### CommonJS

```js
const { breakTask } = require("task-breaker");
```

---

## API

### `breakTask(options): Promise<BreakTaskResult>`

| Option        | Type           | Required | Default | Description                                              |
| ------------- | -------------- | -------- | ------- | -------------------------------------------------------- |
| `task`        | `string \| Task` | ✅     | —       | Root task text or an existing task tree to expand.       |
| `temperature` | `number` (int) | ❌       | `3`     | Detail level from **1** (fewest) to **5** (most granular). |
| `selectedSubtask` | `number[]` | ❌       | root    | 1-based path to the subtask to expand, e.g. `[3, 5, 2]`. |
| `provider`    | `TaskProvider` | ❌       | built-in | Custom async provider; see below.                       |

**Returns** `BreakTaskResult`:

```ts
{
  task: Task;          // trimmed input task in recursive form
  temperature: number; // temperature used
  subtasks: Task[];    // top-level subtasks from the returned root task
}
```

## Repeated breakdown

You can break down the root task first, then expand any nested subtask later by passing the full task tree back in with a 1-based `selectedSubtask` path:

```ts
import { breakTaskWithAi } from "task-breaker";

const root = await breakTaskWithAi({
  task: { taskName: "launch a consulting business", subtasks: [] },
  temperature: 3,
});

const refined = await breakTaskWithAi({
  task: root.task,
  selectedSubtask: [2],
  temperature: 4,
});

const deeplyRefined = await breakTaskWithAi({
  task: refined.task,
  selectedSubtask: [2, 1],
  temperature: 5,
});
```

---

## Temperature guide

| Temperature | Subtasks returned (example: "build dog house") |
| ----------- | ----------------------------------------------- |
| 1           | `["Buy materials", "Construct it"]`             |
| 2           | 4 steps (plan → buy → build → finish)           |
| 3           | 6 steps with detail                             |
| 4           | 12 steps                                        |
| 5           | 21 steps (fully granular)                       |

---

## Custom provider

Implement the `TaskProvider` interface to plug in your own logic — it may return either raw subtask strings or recursive `Task` objects. Example with raw strings:

```ts
import { breakTask, TaskProvider } from "task-breaker";
import OpenAI from "openai";

const openai = new OpenAI();

const llmProvider: TaskProvider = async (task, temperature) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: temperature / 5, // normalise 1-5 → 0-1
    messages: [
      {
        role: "user",
        content: `Break the following task into ${temperature * 4} subtasks:\n\n"${task}"\n\nReturn only a JSON array of strings.`,
      },
    ],
  });

  const content = response.choices[0].message.content ?? "[]";
  return JSON.parse(content) as string[];
};

const result = await breakTask({
  task: "build a mobile app",
  temperature: 4,
  provider: llmProvider,
});
```

---

## TypeScript types

```ts
export interface Task {
  taskName: string;
  subtasks: Task[];
}

export type TaskProvider = (task: string, temperature: number) => Promise<Array<string | Task>>;

export interface BreakTaskOptions {
  task: string | Task;
  temperature?: number;  // 1–5, default 3
  selectedSubtask?: number[]; // 1-based path into nested subtasks
  provider?: TaskProvider;
}

export interface BreakTaskResult {
  task: Task;
  temperature: number;
  subtasks: Task[];
}
```

---

## Development

```bash
# install dependencies
npm install

# build (ESM + CJS + types)
npm run build

# run tests
npm test
```

---

## License

MIT
