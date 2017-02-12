/// <reference types="vinyl" />
import * as File from 'vinyl';
export declare class Snowball {
    private _path;
    private _parent?;
    children: {
        [key: string]: Snowball;
    };
    data: {
        [key: string]: any;
    };
    getName(child: Snowball): string | false;
    parent: Snowball;
    readonly container: boolean;
    readonly path: Array<string>;
}
export declare class GlacierBuilder {
    root: Snowball;
    basePath: string;
    extraFiles: Array<File>;
    constructor(root: Snowball, basePath: string);
    forEach(callback: (node: Snowball) => any, root?: Snowball): void;
    getFilePath(ball: Snowball, file: string): Promise<string>;
    getFile(ball: Snowball, file: string, subdir?: string): Promise<File>;
}
export interface SnowstormOptions {
}
export interface MeltdownOptions {
    staticPath: string;
}
export declare function cleanAliasPart(part: string): string;
export declare function snowstorm(_options?: any): (files: File[]) => Promise<GlacierBuilder>;
export declare function meltdown(_options?: any): (glacier: GlacierBuilder) => Promise<File[]>;
