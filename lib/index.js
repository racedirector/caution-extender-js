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
    CautionExtenderEvents["Extension"] = "extension";
})(CautionExtenderEvents = exports.CautionExtenderEvents || (exports.CautionExtenderEvents = {}));
class CautionExtender extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.onUpdate = () => {
            var _a, _b, _c;
            const { data } = this.socket;
            const flags = data.SessionFlags;
            const sessionNumber = data.SessionNum || -1;
            const sessionName = ((_c = (_b = (_a = data.SessionInfo) === null || _a === void 0 ? void 0 : _a.Sessions) === null || _b === void 0 ? void 0 : _b[sessionNumber]) === null || _c === void 0 ? void 0 : _c.SessionName) || null;
            if (sessionName === "RACE" &&
                flags & 0x0200 &&
                flags & 0x4000) {
                this.emit(CautionExtenderEvents.Extension);
            }
        };
        this.socket = new iracing_socket_js_1.iRacingSocket({
            server: options.server,
            fps: 1,
            requestParameters: exports.IRACING_REQUEST_PARAMS,
        });
        this.socket.on(iracing_socket_js_1.iRacingSocketEvents.Update, this.onUpdate);
    }
}
exports.CautionExtender = CautionExtender;
exports.default = CautionExtender;
