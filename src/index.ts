export type Listener<T> = (data: T) => void;

export interface Emitter<Events extends { [K in keyof Events]: Events[K] }> {
  on<K extends keyof Events>(
    event: K,
    listener: Listener<Events[K]>,
  ): () => void;
  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void;
  emit<K extends keyof Events>(event: K, data: Events[K]): void;
}

export function createEmitter<
  Events extends { [K in keyof Events]: Events[K] },
>(): Emitter<Events> {
  const m = new Map<keyof Events, Set<Listener<never>>>();
  return {
    on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
      let s = m.get(event);
      if (!s) m.set(event, (s = new Set()));
      s.add(listener as Listener<never>);
      return () => {
        s.delete(listener as Listener<never>);
      };
    },
    off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
      m.get(event)?.delete(listener as Listener<never>);
    },
    emit<K extends keyof Events>(event: K, data: Events[K]) {
      m.get(event)?.forEach((fn) => {
        fn(data as never);
      });
    },
  };
}
