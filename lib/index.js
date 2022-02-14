"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CautionExtender = exports.CautionExtenderEvents = exports.IRACING_REQUEST_PARAMS = void 0;
const iracing_socket_js_1 = require("iracing-socket-js");
const events_1 = require("events");
exports.IRACING_REQUEST_PARAMS = [
    "SessionFlags",
    "SessionInfo",
    "SessionNum",
    "SessionTime",
];
var CautionExtenderEvents;
(function (CautionExtenderEvents) {
    CautionExtenderEvents["PaceStart"] = "paceStart";
    CautionExtenderEvents["Extension"] = "extension";
})(CautionExtenderEvents = exports.CautionExtenderEvents || (exports.CautionExtenderEvents = {}));
const CAUTION_FLAG = 0x4000;
const CAUTION_WAVING_FLAG = 0x8000;
const ONE_TO_GREEN_FLAG = 0x0200;
const flagHasCaution = (flagValue) => !!(flagValue & CAUTION_FLAG);
const flagHasOneToGreen = (flagValue) => !!(flagValue & ONE_TO_GREEN_FLAG);
const flagHasCautionWaving = (flagValue) => !!(flagValue & CAUTION_WAVING_FLAG);
class CautionExtender extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.onUpdate = () => {
            var _a, _b;
            const { data: { SessionFlags: flags = -1, SessionNum: sessionNumber = -1, SessionInfo: sessionInfo = {}, } = {}, } = this.socket;
            const sessionName = ((_b = (_a = sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.Sessions) === null || _a === void 0 ? void 0 : _a[sessionNumber]) === null || _b === void 0 ? void 0 : _b.SessionName) || null;
            if (sessionName === "RACE") {
                if (flagHasCautionWaving(this.previousFlags) && flagHasCaution(flags)) {
                    this.emit(CautionExtenderEvents.PaceStart);
                }
                if (flagHasOneToGreen(flags) && flagHasCaution(flags)) {
                    this.emit(CautionExtenderEvents.Extension);
                }
            }
            this.previousFlags = flags;
        };
        this.socket =
            options.socket instanceof iracing_socket_js_1.iRacingSocket
                ? options.socket
                : new iracing_socket_js_1.iRacingSocket(options.socket);
        this.socket.on(iracing_socket_js_1.iRacingSocketEvents.Update, this.onUpdate);
    }
}
exports.CautionExtender = CautionExtender;
exports.default = CautionExtender;
