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

const result = await breakTask({ task: "build dog house", temperature: 2 });
console.log(result.subtasks);
// → ["Plan the design", "Buy materials", "Build the structure", "Finish and paint"]
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
| `task`        | `string`       | ✅       | —       | Plain-language description of the task to break down.    |
| `temperature` | `number` (int) | ❌       | `3`     | Detail level from **1** (fewest) to **5** (most granular). |
| `provider`    | `TaskProvider` | ❌       | built-in | Custom async provider; see below.                       |

**Returns** `BreakTaskResult`:

```ts
{
  task: string;        // trimmed input task
  temperature: number; // temperature used
  subtasks: string[];  // ordered list of subtasks
}
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

Implement the `TaskProvider` interface to plug in your own logic — for example, an LLM call:

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
export type TaskProvider = (task: string, temperature: number) => Promise<string[]>;

export interface BreakTaskOptions {
  task: string;
  temperature?: number;  // 1–5, default 3
  provider?: TaskProvider;
}

export interface BreakTaskResult {
  task: string;
  temperature: number;
  subtasks: string[];
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
