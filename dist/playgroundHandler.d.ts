import { PHPRequestHandler } from "@php-wasm/universal";
import { Blueprint } from "@wp-playground/blueprints";
import { MountPaths } from "./lib.js";
export declare function getSingletonHandlerPromise(blueprint: Blueprint, mountPaths?: MountPaths): Promise<PHPRequestHandler>;
