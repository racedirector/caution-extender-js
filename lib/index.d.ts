/// <reference types="node" />
import { EventEmitter } from "events";
export declare const IRACING_REQUEST_PARAMS: string[];
export declare enum CautionExtenderEvents {
    Extension = "extension"
}
export interface CautionExtenderOptions {
    server: string;
}
export declare class CautionExtender extends EventEmitter {
    private socket;
    constructor(options?: CautionExtenderOptions);
    private onUpdate;
}
export default CautionExtender;
