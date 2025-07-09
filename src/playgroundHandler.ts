import { PHPRequestHandler } from "@php-wasm/universal";
import { Blueprint } from "@wp-playground/blueprints";
import { createPlaygroundRequestHandler } from "./playground.js";
import { MountPaths } from "./lib.js";

const HANDLER_PROMISE_SYMBOL = Symbol.for('HANDLER_PROMISE');

interface PlaygroundGlobal {
  [key: symbol]: Promise<PHPRequestHandler> | undefined;
}

export function getSingletonHandlerPromise(blueprint: Blueprint, mountPaths?: MountPaths): Promise<PHPRequestHandler> {
  const globalObj = global as unknown as PlaygroundGlobal;
  
  if (!globalObj[HANDLER_PROMISE_SYMBOL]) {
    globalObj[HANDLER_PROMISE_SYMBOL] = createHandler(blueprint, mountPaths);
  }
  return globalObj[HANDLER_PROMISE_SYMBOL]!;
}

async function createHandler(blueprint: Blueprint, mountPaths?: MountPaths): Promise<PHPRequestHandler> {
  console.log("Creating singleton Playground handler...");
  const handler = await createPlaygroundRequestHandler(blueprint, mountPaths);
  console.log("Singleton Playground handler created successfully");
  return handler;
}