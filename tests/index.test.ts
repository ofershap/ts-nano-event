import { describe, it, expect, vi } from "vitest";
import { createEmitter } from "../src/index.js";

interface TestEvents {
  click: { x: number; y: number };
  message: string;
  logout: undefined;
}

describe("createEmitter", () => {
  it("calls listener on emit", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    emitter.on("click", fn);
    emitter.emit("click", { x: 1, y: 2 });
    expect(fn).toHaveBeenCalledWith({ x: 1, y: 2 });
  });

  it("supports multiple listeners for same event", () => {
    const emitter = createEmitter<TestEvents>();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    emitter.on("message", fn1);
    emitter.on("message", fn2);
    emitter.emit("message", "hello");
    expect(fn1).toHaveBeenCalledWith("hello");
    expect(fn2).toHaveBeenCalledWith("hello");
  });

  it("does not call listeners for other events", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    emitter.on("click", fn);
    emitter.emit("message", "hello");
    expect(fn).not.toHaveBeenCalled();
  });

  it("removes listener via off()", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    emitter.on("click", fn);
    emitter.off("click", fn);
    emitter.emit("click", { x: 0, y: 0 });
    expect(fn).not.toHaveBeenCalled();
  });

  it("removes listener via returned unsubscribe function", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    const unsub = emitter.on("click", fn);
    unsub();
    emitter.emit("click", { x: 0, y: 0 });
    expect(fn).not.toHaveBeenCalled();
  });

  it("handles emit with no listeners", () => {
    const emitter = createEmitter<TestEvents>();
    expect(() => emitter.emit("click", { x: 0, y: 0 })).not.toThrow();
  });

  it("handles off() for non-registered listener", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    expect(() => emitter.off("click", fn)).not.toThrow();
  });

  it("handles off() for event with no listeners at all", () => {
    const emitter = createEmitter<TestEvents>();
    expect(() =>
      emitter.off("click", () => {
        /* noop */
      }),
    ).not.toThrow();
  });

  it("supports events with undefined data", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    emitter.on("logout", fn);
    emitter.emit("logout", undefined);
    expect(fn).toHaveBeenCalledWith(undefined);
  });

  it("preserves other listeners when one is removed", () => {
    const emitter = createEmitter<TestEvents>();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    emitter.on("message", fn1);
    emitter.on("message", fn2);
    emitter.off("message", fn1);
    emitter.emit("message", "hello");
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledWith("hello");
  });

  it("calls listener multiple times across multiple emits", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    emitter.on("message", fn);
    emitter.emit("message", "a");
    emitter.emit("message", "b");
    emitter.emit("message", "c");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, "a");
    expect(fn).toHaveBeenNthCalledWith(2, "b");
    expect(fn).toHaveBeenNthCalledWith(3, "c");
  });

  it("can re-subscribe the same listener after unsubscribe", () => {
    const emitter = createEmitter<TestEvents>();
    const fn = vi.fn();
    const unsub = emitter.on("message", fn);
    unsub();
    emitter.on("message", fn);
    emitter.emit("message", "hello");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("isolates separate emitter instances", () => {
    const emitter1 = createEmitter<TestEvents>();
    const emitter2 = createEmitter<TestEvents>();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    emitter1.on("message", fn1);
    emitter2.on("message", fn2);
    emitter1.emit("message", "only-1");
    expect(fn1).toHaveBeenCalledWith("only-1");
    expect(fn2).not.toHaveBeenCalled();
  });
});
