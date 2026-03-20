import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface backendInterface {
    cleanAndFormatContent(content: Array<string>): Promise<Array<string>>;
    generateScript(topic: string): Promise<Array<string>>;
    getRecentScripts(): Promise<Array<[Time, Array<string>]>>;
}
