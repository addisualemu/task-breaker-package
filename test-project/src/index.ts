import { breakTaskWithAi } from "task-breaker";

async function main() {
  try {
    const result = await breakTaskWithAi({
      task: "Setup selinium with ChromeDriver  .",
      temperature: 15,
    });

    console.log("=== AI Provider ===");
    console.log(`Task: ${result.task}`);
    console.log(`Temperature: ${result.temperature}`);
    console.log("Subtasks:");
    result.subtasks.forEach((subtask, i) => {
      console.log(`  ${i + 1}. ${subtask}`);
    });
  } catch (error) {
    console.error(`AI provider error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
