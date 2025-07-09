import { createPlaygroundRequestHandler } from "./playground.js";
const HANDLER_PROMISE_SYMBOL = Symbol.for('HANDLER_PROMISE');
export function getSingletonHandlerPromise(blueprint) {
    const globalObj = global;
    if (!globalObj[HANDLER_PROMISE_SYMBOL]) {
        globalObj[HANDLER_PROMISE_SYMBOL] = createHandler(blueprint);
    }
    return globalObj[HANDLER_PROMISE_SYMBOL];
}
async function createHandler(blueprint) {
    console.log("Creating singleton Playground handler...");
    const handler = await createPlaygroundRequestHandler(blueprint);
    console.log("Singleton Playground handler created successfully");
    return handler;
}
//# sourceMappingURL=playgroundHandler.js.map