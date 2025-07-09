import { PHPRequest, PHPRequestHandler } from "@php-wasm/universal";
export declare const requestFollowRedirects: (handler: PHPRequestHandler, request: PHPRequest) => Promise<import("@php-wasm/universal").PHPResponse>;
export declare function fetchFileAsFileObject(url: string, fileName: string): Promise<File>;
