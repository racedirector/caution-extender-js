"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CautionExtender = exports.CautionExtenderEvents = exports.IRACING_REQUEST_PARAMS = void 0;
const iracing_socket_js_1 = require("iracing-socket-js");
const lodash_1 = require("lodash");
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
const flagHasCaution = (flagValue) => (0, iracing_socket_js_1.flagsHasFlag)(flagValue, iracing_socket_js_1.Flags.Caution);
const flagHasCautionWaving = (flagValue) => (0, iracing_socket_js_1.flagsHasFlag)(flagValue, iracing_socket_js_1.Flags.CautionWaving);
const extensionRequired = (flagValue) => (0, iracing_socket_js_1.flagsHasFlag)(flagValue, iracing_socket_js_1.Flags.OneLapToGreen | iracing_socket_js_1.Flags.Caution);
class CautionExtender extends iracing_socket_js_1.iRacingSocketConsumer {
    constructor({ socket }) {
        super(socket);
        this.onUpdate = (keys) => {
            var _a, _b;
            if ((0, lodash_1.isEmpty)((0, lodash_1.intersection)(keys, ["SessionFlags", "SessionNum"]))) {
                return;
            }
            const { SessionFlags: flags = -1, SessionNum: sessionNumber = -1, SessionInfo: sessionInfo = {}, } = this.socket.data;
            if (((_b = (_a = sessionInfo === null || sessionInfo === void 0 ? void 0 : sessionInfo.Sessions) === null || _a === void 0 ? void 0 : _a[sessionNumber]) === null || _b === void 0 ? void 0 : _b.SessionName) === "RACE") {
                if (flagHasCautionWaving(this.previousFlags) && flagHasCaution(flags)) {
                    this.emit(CautionExtenderEvents.PaceStart);
                }
                if (extensionRequired(flags)) {
                    this.emit(CautionExtenderEvents.Extension);
                }
            }
            this.previousFlags = flags;
        };
    }
}
exports.CautionExtender = CautionExtender;
exports.default = CautionExtender;
