"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceDirector = void 0;
const iracing_socket_js_1 = require("iracing-socket-js");
const TELEMETRY_KEYS = [
    "CarIdxGear",
    "CarIdxLapDistPct",
    "CarIdxOnPitRoad",
    "CarIdxRPM",
    "CarIdxTrackSurface",
    "CarIdxTrackSurfaceMaterial",
];
class RaceDirector {
    constructor(options) {
        this.socket = new iracing_socket_js_1.iRacingSocket({
            server: options.server,
            requestParameters: [
                ...TELEMETRY_KEYS,
                "DriverInfo",
                "RaceLaps",
                "SessionFlags",
                "SessionInfo",
                "SessionNum",
                "SessionState",
                "SessionTick",
                "SessionTime",
                "WeekendInfo",
            ],
        });
        this.socket.on(iracing_socket_js_1.iRacingSocketEvents.Update, (keys) => {
            console.log("Keys did update:", keys);
            console.log("Data", this.socket.data);
        });
    }
}
exports.RaceDirector = RaceDirector;
exports.default = RaceDirector;
