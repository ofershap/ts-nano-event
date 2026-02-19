# ts-nano-event — Tiny Type-Safe Event Emitter for TypeScript

[![npm version](https://img.shields.io/npm/v/ts-nano-event.svg)](https://www.npmjs.com/package/ts-nano-event)
[![npm downloads](https://img.shields.io/npm/dm/ts-nano-event.svg)](https://www.npmjs.com/package/ts-nano-event)
[![CI](https://github.com/ofershap/ts-nano-event/actions/workflows/ci.yml/badge.svg)](https://github.com/ofershap/ts-nano-event/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle size](https://img.shields.io/badge/minified-284_B-brightgreen)](https://github.com/ofershap/ts-nano-event)
[![Bundle size gzip](https://img.shields.io/badge/gzip-203_B-brightgreen)](https://github.com/ofershap/ts-nano-event)

A tiny (203B gzip), fully-typed event emitter that catches wrong event names and wrong payloads **at compile time** — not at runtime. Zero dependencies.

```ts
const emitter = createEmitter<{ login: { user: string } }>();
emitter.on("login", (data) => data.user); // ✅ autocomplete works
emitter.emit("login", { wrong: true }); // ❌ compile error — caught before you ship
```

> 203 bytes gzipped. Full TypeScript inference. Zero dependencies. Works with both `type` and `interface`.

![ts-nano-event demo — TypeScript autocomplete and compile-time error for wrong event payload](assets/demo.gif)

## What is an event emitter?

An event emitter is a **notification system inside your code**. It lets one part of your app say "something happened" and other parts react to it — without them knowing about each other.

Think of it like a Slack channel:

- **Subscribe** — you join `#deployments` (`on`)
- **Publish** — someone posts "deploy finished" (`emit`)
- **Everyone subscribed gets the message** — without the poster knowing who's listening
- **Unsubscribe** — you leave the channel anytime (`off`)

If you've ever used `element.addEventListener("click", handler)` in the browser — that's an event emitter. This library is the same concept, but for your own custom events, anywhere in your code, with TypeScript making sure you never make a mistake.

### When do you need one?

You need an event emitter when **one thing happens** and **multiple parts of your code need to react**, but you don't want to hardcode those connections:

```ts
// ❌ Without an emitter — tight coupling, hard to extend
function onFormSubmit(data: FormData) {
  updateSidebar(data); // sidebar knows about form
  showToast("Saved!"); // toast knows about form
  trackAnalytics("submit"); // analytics knows about form
  syncToServer(data); // server sync knows about form
}

// ✅ With an emitter — decoupled, each module subscribes independently
emitter.emit("form:submit", data);

// In sidebar.ts
emitter.on("form:submit", (data) => updateSidebar(data));
// In toast.ts
emitter.on("form:submit", () => showToast("Saved!"));
// In analytics.ts
emitter.on("form:submit", () => track("submit"));
```

**Common use cases:**

- **UI components** — a form submits, and the sidebar, toast, and analytics all need to know
- **Plugin systems** — your library fires events, users write plugins that hook into them
- **WebSocket/real-time apps** — messages arrive, different handlers process different types
- **State management** — data changes, multiple views need to update
- **Microservice communication** — services emit events without knowing who consumes them

## Why this library?

Popular event emitters like [mitt](https://github.com/developit/mitt) and [nanoevents](https://github.com/ai/nanoevents) are great — they're tiny and battle-tested. But most lightweight emitters don't fully leverage TypeScript's type system. You can often misspell an event name, pass the wrong payload shape, or need to cast handler parameters manually — and the compiler won't catch it.

`ts-nano-event` is built from the ground up for TypeScript. Every event name and every payload is checked at compile time:

```ts
import { createEmitter } from "ts-nano-event";

interface Events {
  login: { user: string };
}

const emitter = createEmitter<Events>();

emitter.on("login", (data) => {
  data.user; // ✅ TypeScript knows this is string — autocomplete works
});

emitter.emit("login", { user: "Alice" }); // ✅ correct payload
emitter.emit("login", { wrong: true }); // ❌ compile error — caught instantly
emitter.emit("typo", {}); // ❌ compile error — "typo" is not an event
```

No casting. No `any`. No runtime surprises.

## Comparison

|                            | ts-nano-event                                 | mitt                                             | nanoevents      |
| -------------------------- | --------------------------------------------- | ------------------------------------------------ | --------------- |
| **Fully typed `emit()`**   | Yes — wrong payloads are compile errors       | Partial — payload typed as `unknown` in handlers | No — uses `any` |
| **Typed `on()` inference** | Yes — listener params inferred from event map | Yes                                              | Yes             |
| **Works with `interface`** | Yes                                           | No — only `type`                                 | No              |
| **Unsubscribe return**     | `on()` returns unsub function                 | No — must call `off()`                           | Yes             |
| **Size (min+gzip)**        | **203 B**                                     | ~200 B                                           | ~107 B          |
| **Dependencies**           | 0                                             | 0                                                | 0               |

## Install

```bash
npm install ts-nano-event
```

```bash
pnpm add ts-nano-event
```

```bash
yarn add ts-nano-event
```

## Usage

### Basic example

```ts
import { createEmitter } from "ts-nano-event";

interface Events {
  "user:login": { id: string; name: string };
  "user:logout": undefined;
  resize: { width: number; height: number };
}

const emitter = createEmitter<Events>();

// Subscribe — listener type is inferred automatically
emitter.on("user:login", (data) => {
  console.log(data.name); // ✅ TypeScript knows this is string
});

// Unsubscribe — on() returns a cleanup function
const off = emitter.on("resize", (data) => {
  console.log(data.width, data.height);
});
off(); // removes this listener

// Emit — payload is type-checked
emitter.emit("user:login", { id: "1", name: "Alice" }); // ✅
emitter.emit("user:logout", undefined); // ✅
// emitter.emit("user:login", { wrong: true });           // ❌ compile error
// emitter.emit("typo", {});                               // ❌ compile error
```

### React — cross-component communication

```tsx
// events.ts
import { createEmitter } from "ts-nano-event";

interface AppEvents {
  "cart:add": { productId: string; quantity: number };
  "cart:clear": undefined;
  "theme:change": { mode: "light" | "dark" };
}

export const bus = createEmitter<AppEvents>();
```

```tsx
// AddToCartButton.tsx
import { bus } from "./events";

function AddToCartButton({ productId }: { productId: string }) {
  return (
    <button onClick={() => bus.emit("cart:add", { productId, quantity: 1 })}>
      Add to Cart
    </button>
  );
}
```

```tsx
// CartBadge.tsx
import { useEffect, useState } from "react";
import { bus } from "./events";

function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const off = bus.on("cart:add", (data) => {
      setCount((c) => c + data.quantity); // ✅ data.quantity is number
    });
    return off; // cleanup on unmount
  }, []);

  return <span>{count}</span>;
}
```

### Node.js — decoupled modules

```ts
// logger-events.ts
import { createEmitter } from "ts-nano-event";

interface LogEvents {
  info: { message: string; context?: Record<string, unknown> };
  error: { message: string; error: Error };
  metric: { name: string; value: number; unit: string };
}

export const logger = createEmitter<LogEvents>();
```

```ts
// In your API handler
logger.emit("info", { message: "User signed up", context: { userId: "123" } });
logger.emit("metric", { name: "signup_duration_ms", value: 42, unit: "ms" });

// In a separate logging module — doesn't import the API handler
logger.on("error", (data) => {
  Sentry.captureException(data.error);
});

logger.on("metric", (data) => {
  StatsD.gauge(data.name, data.value);
});
```

### Plugin system

```ts
import { createEmitter } from "ts-nano-event";

interface PluginEvents {
  "before:request": { url: string; method: string };
  "after:response": { url: string; status: number; body: unknown };
  error: { url: string; error: Error };
}

const hooks = createEmitter<PluginEvents>();

// Plugin A: logging
hooks.on("before:request", (req) => console.log(`→ ${req.method} ${req.url}`));
hooks.on("after:response", (res) => console.log(`← ${res.status} ${res.url}`));

// Plugin B: retry on failure
hooks.on("error", (data) => {
  if (data.error.message.includes("timeout")) {
    retryQueue.add(data.url);
  }
});

// Core library emits events — plugins react without modifying core code
async function fetchWithHooks(url: string) {
  hooks.emit("before:request", { url, method: "GET" });
  try {
    const res = await fetch(url);
    hooks.emit("after:response", {
      url,
      status: res.status,
      body: await res.json(),
    });
  } catch (error) {
    hooks.emit("error", { url, error: error as Error });
  }
}
```

## API

### `createEmitter<Events>()`

Creates a new emitter instance. `Events` is a `type` or `interface` mapping event names to their payload types.

```ts
const emitter = createEmitter<Events>();
```

Returns an object with three methods:

### `on(event, listener) → unsubscribe`

Subscribe to an event. Returns a function that removes the listener when called.

```ts
const off = emitter.on("resize", (data) => {
  console.log(data.width, data.height);
});
off(); // removes this specific listener
```

### `off(event, listener)`

Remove a specific listener by reference. Alternative to calling the unsubscribe function.

```ts
const handler = (data: { width: number; height: number }) => {
  /* ... */
};
emitter.on("resize", handler);
emitter.off("resize", handler); // removes it
```

### `emit(event, data)`

Emit an event with the associated payload. All registered listeners are called synchronously in subscription order.

```ts
emitter.emit("resize", { width: 1024, height: 768 });
```

## Types

The package exports all types for advanced use cases:

```ts
import type { Emitter, Listener } from "ts-nano-event";

// Use Emitter type to pass emitters around
function setupLogging(emitter: Emitter<{ error: { message: string } }>) {
  emitter.on("error", (data) => console.error(data.message));
}
```

## FAQ

**How is this different from Node.js `EventEmitter`?**
Node's built-in `EventEmitter` uses string event names with no type checking. You can emit any event name with any data and TypeScript won't complain. It's also much larger (~4KB) and designed for Node.js, not browsers.

**Can I use this in the browser?**
Yes. It's framework-agnostic — works in Node.js, browsers, Deno, Bun, and any JavaScript runtime. No Node.js APIs are used.

**Does it support wildcard / `*` listeners?**
No. Wildcard listeners add complexity and size. If you need to listen to all events, subscribe to each one individually. This keeps the library at 203 bytes.

**Is it safe to use in production?**
Yes. It's 34 lines of code with 13 tests covering all edge cases. There's nothing to go wrong.

## Author

**Ofer Shapira**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/ofershap)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat&logo=github&logoColor=white)](https://github.com/ofershap)

## License

[MIT](LICENSE) &copy; [Ofer Shapira](https://github.com/ofershap)
