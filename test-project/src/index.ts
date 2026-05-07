import { breakTaskWithAi } from "task-breaker";

async function main() {
  try {
    const rootResult = await breakTaskWithAi({
      task: {
        taskName:
          "Going from software Engineer to start business as an AI consultant for small businesses.",
        subtasks: [],
      },
      temperature: 5,
    });

    const refinedResult = await breakTaskWithAi({
      task: rootResult.task,
      selectedSubtask: [1],
      temperature: 4,
    });

    console.log("=== AI Provider ===");
    console.log(JSON.stringify(refinedResult.task, null, 2));
  } catch (error) {
    console.error(`AI provider error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
