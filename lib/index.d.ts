import { iRacingSocket, iRacingSocketOptions, iRacingSocketConsumer } from "iracing-socket-js";
export declare const IRACING_REQUEST_PARAMS: string[];
export declare enum CautionExtenderEvents {
    PaceStart = "paceStart",
    Extension = "extension"
}
export interface CautionExtenderOptions {
    socket?: iRacingSocket | iRacingSocketOptions;
}
export declare class CautionExtender extends iRacingSocketConsumer {
    private previousFlags;
    constructor({ socket }: CautionExtenderOptions);
    onUpdate: (keys: any) => void;
}
export default CautionExtender;
