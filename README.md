# ts-nano-event

[![npm version](https://img.shields.io/npm/v/ts-nano-event.svg)](https://www.npmjs.com/package/ts-nano-event)
[![CI](https://github.com/ofershap/ts-nano-event/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/ts-nano-event/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/badge/minified-284_B-brightgreen)](https://github.com/ofershap/ts-nano-event)
[![Bundle size gzip](https://img.shields.io/badge/gzip-203_B-brightgreen)](https://github.com/ofershap/ts-nano-event)

> Typed event emitter in ~200 bytes (gzipped). Full TypeScript inference with zero runtime overhead.

## Why

|                            | ts-nano-event                                 | mitt                                             | nanoevents      |
| -------------------------- | --------------------------------------------- | ------------------------------------------------ | --------------- |
| **Fully typed `emit()`**   | Yes — wrong payloads are compile errors       | Partial — payload typed as `unknown` in handlers | No — uses `any` |
| **Typed `on()` inference** | Yes — listener params inferred from event map | Yes                                              | Yes             |
| **Unsubscribe return**     | `on()` returns unsub function                 | No — must call `off()`                           | Yes             |
| **Size (min+gzip)**        | **203 B**                                     | 200 B                                            | 107 B           |
| **Works with `interface`** | Yes                                           | No                                               | No              |

## Install

```bash
npm install ts-nano-event
```

## Usage

```ts
import { createEmitter } from "ts-nano-event";

// Define your events as a type or interface
interface Events {
  "user:login": { id: string; name: string };
  "user:logout": undefined;
  resize: { width: number; height: number };
}

const emitter = createEmitter<Events>();

// Fully typed — listener gets { id: string; name: string }
emitter.on("user:login", (data) => {
  console.log(data.name); // ✅ autocomplete works
});

// Returns unsubscribe function
const off = emitter.on("resize", (data) => {
  console.log(data.width, data.height);
});
off(); // unsubscribe

// Type-safe emit — wrong payload is a compile error
emitter.emit("user:login", { id: "1", name: "Alice" }); // ✅
// emitter.emit("user:login", { wrong: true });           // ❌ compile error
// emitter.emit("typo", {});                               // ❌ compile error
```

## API

### `createEmitter<Events>()`

Creates a new emitter instance. `Events` is a type or interface mapping event names to their payload types.

Returns an object with:

#### `on(event, listener) → unsubscribe`

Subscribe to an event. Returns a function that removes the listener when called.

```ts
const off = emitter.on("resize", (data) => {
  /* ... */
});
off(); // remove listener
```

#### `off(event, listener)`

Remove a specific listener. Alternative to calling the unsubscribe function.

```ts
const handler = (data: { width: number; height: number }) => {
  /* ... */
};
emitter.on("resize", handler);
emitter.off("resize", handler);
```

#### `emit(event, data)`

Emit an event with the associated payload. All registered listeners are called synchronously.

```ts
emitter.emit("resize", { width: 1024, height: 768 });
```

## Types

The package exports all types for advanced use cases:

```ts
import type { Emitter, Listener } from "ts-nano-event";
```

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)

---

### Other projects by [@ofershap](https://github.com/ofershap)

- [`use-stepper`](https://github.com/ofershap/use-stepper) — React hook for multi-step forms and wizards
- [`hebrew-slugify`](https://github.com/ofershap/hebrew-slugify) — Slugify Hebrew text for URLs
- [`env-guard`](https://github.com/ofershap/env-guard) — Validate .env files against a schema
- [`ai-commit-msg`](https://github.com/ofershap/ai-commit-msg) — GitHub Action for AI commit messages
- [`awesome-hebrew-dev`](https://github.com/ofershap/awesome-hebrew-dev) — Curated list of Hebrew developer resources
