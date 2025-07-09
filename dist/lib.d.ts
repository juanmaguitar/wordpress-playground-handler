import { PHPRequestHandler } from "@php-wasm/universal";
import { Blueprint } from "@wp-playground/blueprints";
export interface MountPaths {
    databasePath?: string;
    muPluginsPath?: string;
}
export interface PlaygroundOptions {
    blueprintPath?: string;
    blueprint?: Blueprint;
    mountPaths?: MountPaths;
}
export declare function getPlaygroundHandler(options?: PlaygroundOptions): Promise<PHPRequestHandler>;
export { PHPRequestHandler, PHPRequest, PHPResponse } from "@php-wasm/universal";
export { Blueprint } from "@wp-playground/blueprints";
