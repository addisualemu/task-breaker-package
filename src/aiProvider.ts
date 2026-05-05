import type { TaskProvider } from "./types.js";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Environment variables read by aiProvider:
 *
 *   TASK_BREAKER_API_URL   Base URL of any OpenAI-compatible API.
 *                          e.g. https://api.openai.com/v1
 *                               https://my-azure-instance.openai.azure.com/openai/deployments/my-model
 *                               http://localhost:11434/v1   (Ollama)
 *
 *   TASK_BREAKER_API_KEY   Bearer token / API key sent in Authorization header.
 *                          Leave unset or empty for unauthenticated endpoints (e.g. local Ollama).
 *
 *   TASK_BREAKER_MODEL     Model name to request.  Defaults to "gpt-4o-mini".
 */

const ENV_URL = "TASK_BREAKER_API_URL";
const ENV_KEY = "TASK_BREAKER_API_KEY";
const ENV_MODEL = "TASK_BREAKER_MODEL";
const DEFAULT_MODEL = "gpt-4o-mini";
let envLoaded = false;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

function stripWrappingQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function loadDotEnvFile(): void {
  if (envLoaded) {
    return;
  }
  envLoaded = true;

  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }

  const text = readFileSync(envPath, "utf8");
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = stripWrappingQuotes(rawValue);

    // Keep explicit environment variables authoritative.
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function buildPrompt(task: string, temperature: number): ChatMessage[] {
  const detailDescription = [
    "",
    "very broad (2–3 high-level phases)",
    "broad (3–4 steps)",
    "moderate detail (4–6 steps)",
    "detailed (6–10 steps)",
    "highly granular (10+ specific steps)",
  ][temperature];

  return [
    {
      role: "system",
      content:
        "You are a project planning assistant. When given a task, you break it down into an ordered list of subtasks with estimated durations to complete each subtask. " +
        "Respond ONLY with a JSON array of strings — no markdown, no explanation, no code fences. " +
        'Example: ["Step one (1 hr)", "Step two(2hr 30min)", "Step three(4 days)"]',
    },
    {
      role: "user",
      content: `Break down the following task into subtasks. Detail level: about ${temperature} sub tasks.\n\nTask: ${task}`,
    },
  ];
}

function parseSubtasks(content: string): string[] {
  // Strip markdown code fences if the model wraps the response anyway
  const cleaned = content.replace(/^```[^\n]*\n?/m, "").replace(/```$/m, "").trim();
  const parsed = JSON.parse(cleaned);
  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => typeof item === "string")
  ) {
    throw new TypeError("AI response was not a JSON array of strings");
  }
  return parsed as string[];
}

/**
 * AI-backed provider that calls any OpenAI-compatible chat completions API.
 *
 * Configure via environment variables before use:
 *   - TASK_BREAKER_API_URL  (required)
 *   - TASK_BREAKER_API_KEY  (required for authenticated APIs)
 *   - TASK_BREAKER_MODEL    (optional, default: gpt-4o-mini)
 */
export const aiProvider: TaskProvider = async (
  task: string,
  temperature: number
): Promise<string[]> => {
  loadDotEnvFile();

  const baseUrl = process.env[ENV_URL];
  if (!baseUrl) {
    throw new Error(
      `${ENV_URL} environment variable is not set. ` +
        "Point it to any OpenAI-compatible API base URL, e.g. https://api.openai.com/v1"
    );
  }

  const apiKey = process.env[ENV_KEY] ?? "";
  const model = process.env[ENV_MODEL] ?? DEFAULT_MODEL;

  const url = baseUrl.replace(/\/$/, "") + "/chat/completions";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const body = JSON.stringify({
    model,
    messages: buildPrompt(task, temperature),
    temperature: 0.3,
  });

  const response = await fetch(url, { method: "POST", headers, body });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(
      `AI API request failed [${response.status}]: ${errorText}`
    );
  }

  const data = (await response.json()) as ChatCompletionResponse;
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("AI API returned an empty or unexpected response");
  }

  return parseSubtasks(content);
};
