import { PHPRequest, PHPRequestHandler, PHPResponse } from "@php-wasm/universal";
export declare const requestFollowRedirects: (handler: PHPRequestHandler, request: PHPRequest) => Promise<PHPResponse>;
export declare function fetchFileAsFileObject(url: string, fileName: string): Promise<File>;
