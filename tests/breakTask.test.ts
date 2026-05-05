import { breakTask } from "../src/breakTask";
import { defaultProvider } from "../src/defaultProvider";
import type { TaskProvider } from "../src/types";

// ---------------------------------------------------------------------------
// breakTask – input validation
// ---------------------------------------------------------------------------

describe("breakTask – validation", () => {
  test("throws TypeError for empty task string", async () => {
    await expect(breakTask({ task: "" })).rejects.toThrow(TypeError);
    await expect(breakTask({ task: "   " })).rejects.toThrow(TypeError);
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
});

// ---------------------------------------------------------------------------
// breakTask – result shape
// ---------------------------------------------------------------------------

describe("breakTask – result shape", () => {
  test("returns correct task and temperature in result", async () => {
    const result = await breakTask({ task: "build dog house", temperature: 2 });
    expect(result.task).toBe("build dog house");
    expect(result.temperature).toBe(2);
  });

  test("subtasks is a non-empty array of strings", async () => {
    const result = await breakTask({ task: "build dog house", temperature: 1 });
    expect(Array.isArray(result.subtasks)).toBe(true);
    expect(result.subtasks.length).toBeGreaterThan(0);
    result.subtasks.forEach((s) => expect(typeof s).toBe("string"));
  });

  test("trims whitespace from task input", async () => {
    const result = await breakTask({ task: "  build dog house  ", temperature: 1 });
    expect(result.task).toBe("build dog house");
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
    expect(result.subtasks).toEqual(["custom subtask 1", "custom subtask 2"]);
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
