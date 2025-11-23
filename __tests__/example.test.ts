import { describe, it, expect } from "vitest";

describe("Example Test Suite", () => {
  it("should add numbers correctly", () => {
    const result = 1 + 2;
    expect(result).toBe(3);
  });

  it("should handle string concatenation", () => {
    const result = "Hello" + " " + "World";
    expect(result).toBe("Hello World");
  });

  it("should work with arrays", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(arr).toHaveLength(5);
    expect(arr).toContain(3);
  });

  it("should work with objects", () => {
    const obj = { name: "Test", value: 42 };
    expect(obj).toHaveProperty("name");
    expect(obj.value).toBe(42);
  });
});
