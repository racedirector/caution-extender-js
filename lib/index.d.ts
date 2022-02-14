/// <reference types="node" />
import { iRacingSocket, iRacingSocketOptions } from "iracing-socket-js";
import { EventEmitter } from "events";
export declare const IRACING_REQUEST_PARAMS: string[];
export declare enum CautionExtenderEvents {
    PaceStart = "paceStart",
    Extension = "extension"
}
export interface CautionExtenderOptions {
    socket?: iRacingSocket | iRacingSocketOptions;
}
export declare class CautionExtender extends EventEmitter {
    private socket;
    private previousFlags;
    constructor(options: CautionExtenderOptions);
    private onUpdate;
}
export default CautionExtender;
