import "dotenv/config";
import { breakTask, aiProvider } from "task-breaker";

/**
 * Example 1: Using default provider with default temperature
 */
async function example1() {
  console.log("=== Example 1: Default Behavior ===");
  const result = await breakTask({
    task: "Build ios app",
  });
  console.log(`Task: ${result.task}`);
  console.log(`Temperature: ${result.temperature}`);
  console.log("Subtasks:");
  result.subtasks.forEach((subtask, i) => {
    console.log(`  ${i + 1}. ${subtask}`);
  });
  console.log();
}

/**
 * Example 2: Using different temperature levels
 */
async function example2() {
  console.log("=== Example 2: Different Temperature Levels ===");
  for (const temp of [1, 3, 5]) {
    const result = await breakTask({
      task: "Develop a mobile app",
      temperature: temp,
    });
    console.log(`\nTemperature ${temp} (${temp === 1 ? "coarse" : temp === 5 ? "granular" : "medium"}):`);
    result.subtasks.forEach((subtask) => {
      console.log(`  - ${subtask}`);
    });
  }
  console.log();
}

/**
 * Example 3: Using a custom provider
 */
async function example3() {
  console.log("=== Example 3: Custom Provider ===");
  
  // Simple custom provider that returns fixed subtasks based on temperature
  const customProvider = async (task: string, temperature: number): Promise<string[]> => {
    if (temperature <= 2) {
      return ["Plan", "Execute", "Review"];
    } else if (temperature <= 4) {
      return ["Analyze requirements", "Design solution", "Implement", "Test", "Deploy"];
    } else {
      return [
        "Gather requirements",
        "Design architecture",
        "Implement core features",
        "Add supporting features",
        "Write tests",
        "Code review",
        "Deploy to staging",
        "Deploy to production",
      ];
    }
  };

  const result = await breakTask({
    task: "Launch a new feature",
    temperature: 4,
    provider: customProvider,
  });
  console.log(`Task: ${result.task}`);
  console.log("Subtasks with custom provider:");
  result.subtasks.forEach((subtask, i) => {
    console.log(`  ${i + 1}. ${subtask}`);
  });
  console.log();
}

/**
 * Example 4: Using aiProvider (requires env vars)
 *
 * Set these before running:
 *   $env:TASK_BREAKER_API_URL = "https://api.openai.com/v1"   # or any compatible endpoint
 *   $env:TASK_BREAKER_API_KEY = "sk-..."                       # your API key
 *   $env:TASK_BREAKER_MODEL   = "gpt-4o-mini"                  # optional, this is the default
 */
async function example4() {
  console.log("=== Example 4: AI Provider ===");

  if (!process.env.TASK_BREAKER_API_URL) {
    console.log(
      "Skipped — set TASK_BREAKER_API_URL (and TASK_BREAKER_API_KEY) to enable.\n"
    );
    return;
  }

  try {
    const result = await breakTask({
      task: "Build an iOS app",
      temperature: 3,
      provider: aiProvider,
    });
    console.log(`Task: ${result.task}`);
    console.log(`Temperature: ${result.temperature}`);
    console.log("Subtasks:");
    result.subtasks.forEach((subtask, i) => {
      console.log(`  ${i + 1}. ${subtask}`);
    });
  } catch (e) {
    console.log(`✗ AI provider error: ${(e as Error).message}`);
  }
  console.log();
}

/**
 * Example 5: Error handling
 */
async function example5() {
  console.log("=== Example 5: Error Handling ===");
  
  try {
    await breakTask({ task: "" });
  } catch (e) {
    console.log(`✓ Empty task error caught: ${(e as Error).message}`);
  }

  try {
    await breakTask({ task: "Some task", temperature: 10 });
  } catch (e) {
    console.log(`✓ Invalid temperature error caught: ${(e as Error).message}`);
  }
  console.log();
}

/**
 * Run all examples
 */
async function main() {
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    console.log("✓ All examples completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
