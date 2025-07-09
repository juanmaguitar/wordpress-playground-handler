import { createPlaygroundRequestHandler } from "./playground.js";
const HANDLER_PROMISE_SYMBOL = Symbol.for('HANDLER_PROMISE');
export function getSingletonHandlerPromise(blueprint, mountPaths) {
    const globalObj = global;
    if (!globalObj[HANDLER_PROMISE_SYMBOL]) {
        globalObj[HANDLER_PROMISE_SYMBOL] = createHandler(blueprint, mountPaths);
    }
    return globalObj[HANDLER_PROMISE_SYMBOL];
}
async function createHandler(blueprint, mountPaths) {
    console.log("Creating singleton Playground handler...");
    const handler = await createPlaygroundRequestHandler(blueprint, mountPaths);
    console.log("Singleton Playground handler created successfully");
    return handler;
}
//# sourceMappingURL=playgroundHandler.js.map