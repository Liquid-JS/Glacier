/// <reference types="node" />
/// <reference types="express" />
import { Router } from 'express';
export declare function getSafePath(url: string): string;
export declare function readFilePromise(file: string): Promise<Buffer>;
export declare class Glacier {
    private config;
    router: Router;
    private cache;
    constructor(config: {
        [key: string]: any;
    });
    getData(urlPath: string, safe?: boolean): Promise<any>;
    resolveTpl(data: any): any;
}
