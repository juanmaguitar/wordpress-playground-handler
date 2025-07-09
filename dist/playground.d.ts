import { PHPRequestHandler } from "@php-wasm/universal";
import { Blueprint } from "@wp-playground/blueprints";
interface MountPaths {
    databasePath?: string;
    muPluginsPath?: string;
}
export declare function createPlaygroundRequestHandler(blueprint: Blueprint, mountPaths?: MountPaths): Promise<PHPRequestHandler>;
export {};
