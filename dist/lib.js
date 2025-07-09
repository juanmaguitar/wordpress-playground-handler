import { getSingletonHandlerPromise } from "./playgroundHandler.js";
import { readFileSync } from "fs";
import { resolve } from "path";
let cachedHandler = null;
export async function getPlaygroundHandler(options = {}) {
    if (!cachedHandler) {
        let blueprint;
        if (options.blueprint) {
            blueprint = options.blueprint;
        }
        else if (options.blueprintPath) {
            blueprint = JSON.parse(readFileSync(resolve(options.blueprintPath), "utf8"));
        }
        else {
            blueprint = JSON.parse(readFileSync(resolve("./wordpress/blueprint.json"), "utf8"));
        }
        cachedHandler = getSingletonHandlerPromise(blueprint, options.mountPaths);
    }
    return cachedHandler;
}
export { PHPRequestHandler, PHPResponse } from "@php-wasm/universal";
//# sourceMappingURL=lib.js.map