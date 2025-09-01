interface ImportMeta {
  glob: <T>(pattern: string, options?: { eager?: boolean }) => Record<string, T>;
}

declare global {
  interface Window {
    // Add any window globals here if needed
  }

  // DOM types that might be missing in some TypeScript configurations
  interface SVGElement {}
  interface SVGSVGElement extends SVGElement {}
  interface MouseEvent {}
  interface Node {}
  interface AbortController {}
  interface AbortSignal {}
  interface ReadableStream<R = any> {
    getReader(): ReadableStreamDefaultReader<R>;
  }
  interface ReadableStreamDefaultReader<R = any> {
    read(): Promise<ReadableStreamReadResult<R>>;
    releaseLock(): void;
    closed: Promise<undefined>;
    cancel(reason?: any): Promise<void>;
  }
  interface ReadableStreamReadResult<T> {
    done: boolean;
    value: T | undefined;
  }
  interface TextEncoder {
    encode(input?: string): Uint8Array;
  }
  interface TextDecoder {
    decode(input?: any): string;
  }
  interface RequestInit {}
  interface BufferSource {}

  // Global functions
  function alert(message?: string): void;
  function prompt(message?: string, defaultValue?: string): string | null;
}
