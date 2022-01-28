import { iRacingSocket, iRacingSocketEvents } from "iracing-socket-js";
import { EventEmitter } from "events";

export const IRACING_REQUEST_PARAMS = [
  "SessionFlags",
  "SessionInfo",
  "SessionNum",
  "SessionTime",
];

export enum CautionExtenderEvents {
  Extension = "extension",
}

export interface CautionExtenderOptions {
  server: string;
}

export class CautionExtender extends EventEmitter {
  private socket: iRacingSocket;

  constructor(options?: CautionExtenderOptions) {
    super();

    // eslint-disable-next-line new-cap
    this.socket = new iRacingSocket({
      server: options.server,
      fps: 1,
      requestParameters: IRACING_REQUEST_PARAMS,
    });

    this.socket.on(iRacingSocketEvents.Update, this.onUpdate);
  }

  private onUpdate = () => {
    const { data } = this.socket;
    const flags = data.SessionFlags;
    const sessionNumber = data.SessionNum || -1;
    const sessionName =
      data.SessionInfo?.Sessions?.[sessionNumber]?.SessionName || null;

    // If it's a race session, and we get one to green under caution, emit extension event.
    if (
      sessionName === "RACE" &&
      // !!!: One to green
      // eslint-disable-next-line no-bitwise
      flags & 0x0200 &&
      // !!!: Caution flag
      // eslint-disable-next-line no-bitwise
      flags & 0x4000
    ) {
      this.emit(CautionExtenderEvents.Extension);
    }
  };
}

export default CautionExtender;
