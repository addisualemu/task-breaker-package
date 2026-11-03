# Progress

Tracks improvements phase by phase. Mark items `[x]` when done.

Out of scope: `defaultProvider` fixes. It is a test-only helper; production always uses `aiProvider`.

## Phase 1 - Packaging and build correctness

- [x] Add `dist/cjs/package.json` (`{"type":"commonjs"}`) and `dist/esm/package.json` (`{"type":"module"}`) as a post-build step, so `require("task-breaker")` works.
- [ ] Reorder `exports` in `package.json`: put `types` first and add separate `import` / `require` type entries.
- [x] Add a `clean` script and run it before `build`.
- [ ] Add `engines` (`node >= 18`) and `sideEffects: false`.
- [ ] Add `repository`, `author`, `homepage`, and a `LICENSE` file.
- [ ] Verify the package contents with `npm pack --dry-run`.

## Phase 2 - Production uses the AI provider

- [x] Make `breakTask` use `aiProvider` by default in production.
- [x] Keep `defaultProvider` only for tests (not the default, and not documented as a production option).
- [ ] Decide whether to keep `defaultProvider` exported from `src/index.ts`.
- [ ] Update README so the Quick start and Temperature guide describe AI behaviour.

## Phase 3 - AI provider correctness

- [ ] Fix `buildPrompt`: use `detailDescription` or a subtask-count range instead of "about N sub tasks".
- [ ] Align the prompt's granularity with the README temperature guide.
- [ ] Resolve the "estimated durations" mismatch: drop it from the prompt, or add an optional `estimate` field to `Task`.
- [ ] Fix the inconsistent spacing in the prompt example.
- [ ] Harden `parseSubtasks`: stricter code-fence stripping, and `JSON.parse` errors that include a snippet of the model output.

## Phase 4 - AI provider configuration and robustness

- [ ] Add `createAiProvider({ apiUrl, apiKey, model })` for explicit configuration, and keep env vars as the fallback.
- [ ] Allow `breakTaskWithAi` (or `breakTask`) to accept model/config options.
- [ ] Make `.env` loading opt-in, or remove it. Remove the `node:fs` dependency from the core path.
- [ ] Add request timeout and `AbortSignal` support (`signal` option passed through to the provider).
- [ ] Add retry with backoff on 429 and 5xx responses.

## Phase 5 - Core cleanup and API design

- [ ] Merge `normalizeTask` and `toTask` in `breakTask.ts`.
- [ ] Fix the `isTask` error message so it distinguishes bad `task` input from bad provider output.
- [ ] Validate cheap inputs (temperature, path) before normalizing the task tree.
- [ ] Validate provider output: reject empty names, and enforce a maximum depth.
- [ ] Export `TaskLike` from `src/index.ts`.
- [ ] Pass context (ancestor task names) to the provider as a third argument for nested `selectedSubtask`, and use it in the AI prompt.

## Phase 6 - Tests

- [ ] `aiProvider` tests with a mocked `fetch`: success, HTTP error, empty response, malformed JSON, fenced output, missing `TASK_BREAKER_API_URL`.
- [ ] Tests for config precedence (explicit config vs env vars vs `.env`).
- [ ] Tests for `breakTaskWithAi`.
- [ ] Tests for timeout, abort, and retry.
- [ ] Smoke test of the built `dist` via both `import` and `require`.
- [ ] Add a coverage threshold to `jest.config.json`.

## Phase 7 - Docs and tooling

- [ ] README: document `breakTaskWithAi`, the env vars, and the configuration options.
- [ ] README: align the `TaskProvider` / `TaskLike` types with the source.
- [ ] README: add a section on `.env` / configuration and security notes (API key handling).
- [ ] Add ESLint and Prettier.
- [ ] Add CI running build, test, and `npm pack --dry-run`.
