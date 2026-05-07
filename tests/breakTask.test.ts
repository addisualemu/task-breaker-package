import { breakTask } from "../src/breakTask";
import { defaultProvider } from "../src/defaultProvider";
import type { Task, TaskProvider } from "../src/types";

// ---------------------------------------------------------------------------
// breakTask – input validation
// ---------------------------------------------------------------------------

describe("breakTask – validation", () => {
  test("throws TypeError for empty task string", async () => {
    await expect(breakTask({ task: "" })).rejects.toThrow(TypeError);
    await expect(breakTask({ task: "   " })).rejects.toThrow(TypeError);
  });

  test("throws TypeError for empty task name in Task object", async () => {
    await expect(
      breakTask({ task: { taskName: "   ", subtasks: [] } })
    ).rejects.toThrow(TypeError);
  });

  test("throws RangeError for temperature below 1", async () => {
    await expect(
      breakTask({ task: "build a house", temperature: 0 })
    ).rejects.toThrow(RangeError);
  });

  test("throws RangeError for temperature above 5", async () => {
    await expect(
      breakTask({ task: "build a house", temperature: 6 })
    ).rejects.toThrow(RangeError);
  });

  test("throws RangeError for non-integer temperature", async () => {
    await expect(
      breakTask({ task: "build a house", temperature: 2.5 })
    ).rejects.toThrow(RangeError);
  });

  test("throws RangeError for empty selectedSubtask path", async () => {
    await expect(
      breakTask({ task: { taskName: "plan launch", subtasks: [] }, selectedSubtask: [] })
    ).rejects.toThrow(RangeError);
  });

  test("throws RangeError for invalid selectedSubtask segment", async () => {
    await expect(
      breakTask({ task: { taskName: "plan launch", subtasks: [] }, selectedSubtask: [0] })
    ).rejects.toThrow(RangeError);
  });

  test("throws RangeError when selectedSubtask path is out of range", async () => {
    await expect(
      breakTask({
        task: { taskName: "plan launch", subtasks: [{ taskName: "research", subtasks: [] }] },
        selectedSubtask: [2],
      })
    ).rejects.toThrow(RangeError);
  });
});

// ---------------------------------------------------------------------------
// breakTask – result shape
// ---------------------------------------------------------------------------

describe("breakTask – result shape", () => {
  test("returns correct task object and temperature in result", async () => {
    const result = await breakTask({ task: "build dog house", temperature: 2 });
    expect(result.task).toEqual({
      taskName: "build dog house",
      subtasks: result.subtasks,
    });
    expect(result.temperature).toBe(2);
  });

  test("subtasks is a non-empty array of task objects", async () => {
    const result = await breakTask({ task: "build dog house", temperature: 1 });
    expect(Array.isArray(result.subtasks)).toBe(true);
    expect(result.subtasks.length).toBeGreaterThan(0);
    result.subtasks.forEach((subtask) => {
      expect(typeof subtask.taskName).toBe("string");
      expect(Array.isArray(subtask.subtasks)).toBe(true);
    });
  });

  test("trims whitespace from task input", async () => {
    const result = await breakTask({ task: "  build dog house  ", temperature: 1 });
    expect(result.task.taskName).toBe("build dog house");
  });

  test("trims whitespace in nested task input", async () => {
    const result = await breakTask({
      task: {
        taskName: "  launch product  ",
        subtasks: [{ taskName: "  interview users  ", subtasks: [] }],
      },
      temperature: 1,
      selectedSubtask: [1],
      provider: async () => ["draft survey"],
    });

    expect(result.task.taskName).toBe("launch product");
    expect(result.task.subtasks[0].taskName).toBe("interview users");
  });

  test("defaults temperature to 3 when omitted", async () => {
    const result = await breakTask({ task: "build dog house" });
    expect(result.temperature).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// breakTask – temperature controls detail level
// ---------------------------------------------------------------------------

describe("breakTask – temperature detail scaling", () => {
  test("higher temperature produces more subtasks for a known task", async () => {
    const low = await breakTask({ task: "build dog house", temperature: 1 });
    const high = await breakTask({ task: "build dog house", temperature: 5 });
    expect(high.subtasks.length).toBeGreaterThan(low.subtasks.length);
  });

  test("all five temperatures produce valid results", async () => {
    for (let t = 1; t <= 5; t++) {
      const result = await breakTask({ task: "build dog house", temperature: t });
      expect(result.subtasks.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// breakTask – pluggable provider
// ---------------------------------------------------------------------------

describe("breakTask – pluggable provider", () => {
  test("uses custom provider when supplied", async () => {
    const mockProvider: TaskProvider = jest.fn(async (_task, _temp) => [
      "custom subtask 1",
      "custom subtask 2",
    ]);

    const result = await breakTask({
      task: "anything",
      temperature: 3,
      provider: mockProvider,
    });

    expect(mockProvider).toHaveBeenCalledWith("anything", 3);
    expect(result.subtasks).toEqual([
      { taskName: "custom subtask 1", subtasks: [] },
      { taskName: "custom subtask 2", subtasks: [] },
    ]);
  });

  test("custom provider receives trimmed task and correct temperature", async () => {
    const captured: { task: string; temp: number }[] = [];
    const trackingProvider: TaskProvider = async (task, temp) => {
      captured.push({ task, temp });
      return ["ok"];
    };

    await breakTask({ task: "  my task  ", temperature: 4, provider: trackingProvider });
    expect(captured[0]).toEqual({ task: "my task", temp: 4 });
  });

  test("preserves nested task objects returned by a custom provider", async () => {
    const nestedTasks: Task[] = [
      {
        taskName: "parent",
        subtasks: [{ taskName: "child", subtasks: [] }],
      },
    ];
    const trackingProvider: TaskProvider = async () => nestedTasks;

    const result = await breakTask({
      task: "anything",
      temperature: 3,
      provider: trackingProvider,
    });

    expect(result.subtasks).toEqual(nestedTasks);
  });

  test("can further break down a selected subtask and preserve siblings", async () => {
    const rootTask: Task = {
      taskName: "launch product",
      subtasks: [
        { taskName: "research market", subtasks: [] },
        {
          taskName: "build MVP",
          subtasks: [
            { taskName: "define scope", subtasks: [] },
            { taskName: "ship prototype", subtasks: [] },
          ],
        },
        { taskName: "go to market", subtasks: [] },
      ],
    };

    const trackingProvider: TaskProvider = async (taskName) => [
      `${taskName} - step 1`,
      `${taskName} - step 2`,
    ];

    const result = await breakTask({
      task: rootTask,
      temperature: 4,
      selectedSubtask: [2, 2],
      provider: trackingProvider,
    });

    expect(result.task.subtasks[0]).toEqual(rootTask.subtasks[0]);
    expect(result.task.subtasks[1].subtasks[0]).toEqual(rootTask.subtasks[1].subtasks[0]);
    expect(result.task.subtasks[1].subtasks[1]).toEqual({
      taskName: "ship prototype",
      subtasks: [
        { taskName: "ship prototype - step 1", subtasks: [] },
        { taskName: "ship prototype - step 2", subtasks: [] },
      ],
    });
    expect(result.subtasks).toEqual(result.task.subtasks);
  });
});

// ---------------------------------------------------------------------------
// defaultProvider – standalone
// ---------------------------------------------------------------------------

describe("defaultProvider – standalone", () => {
  test("returns subtasks for dog house pattern", async () => {
    const subtasks = await defaultProvider("build dog house", 2);
    expect(subtasks.length).toBeGreaterThan(0);
  });

  test("returns subtasks for unknown task (generic fallback)", async () => {
    const subtasks = await defaultProvider("organise a birthday party", 3);
    expect(Array.isArray(subtasks)).toBe(true);
    expect(subtasks.length).toBeGreaterThan(0);
  });

  test("generic fallback scales with temperature", async () => {
    const low = await defaultProvider("plan a trip", 1);
    const high = await defaultProvider("plan a trip", 5);
    expect(high.length).toBeGreaterThanOrEqual(low.length);
  });
});
