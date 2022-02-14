/* eslint-disable no-bitwise */
import {
  iRacingSocket,
  iRacingSocketEvents,
  iRacingSocketOptions,
} from "iracing-socket-js";
import { EventEmitter } from "events";

export const IRACING_REQUEST_PARAMS = [
  "SessionFlags",
  "SessionInfo",
  "SessionNum",
  "SessionTime",
];

export enum CautionExtenderEvents {
  PaceStart = "paceStart",
  Extension = "extension",
}

const CAUTION_FLAG = 0x4000;
const CAUTION_WAVING_FLAG = 0x8000;
const ONE_TO_GREEN_FLAG = 0x0200;

const flagHasCaution = (flagValue: number): boolean =>
  !!(flagValue & CAUTION_FLAG);
const flagHasOneToGreen = (flagValue: number): boolean =>
  !!(flagValue & ONE_TO_GREEN_FLAG);
const flagHasCautionWaving = (flagValue: number): boolean =>
  !!(flagValue & CAUTION_WAVING_FLAG);

export interface CautionExtenderOptions {
  socket?: iRacingSocket | iRacingSocketOptions;
}

export class CautionExtender extends EventEmitter {
  private socket: iRacingSocket;

  private previousFlags: number;

  constructor(options: CautionExtenderOptions) {
    super();

    this.socket =
      options.socket instanceof iRacingSocket
        ? options.socket
        : new iRacingSocket(options.socket);

    this.socket.on(iRacingSocketEvents.Update, this.onUpdate);
  }

  private onUpdate = () => {
    const {
      data: {
        SessionFlags: flags = -1,
        SessionNum: sessionNumber = -1,
        SessionInfo: sessionInfo = {},
      } = {},
    } = this.socket;

    if (sessionInfo?.Sessions?.[sessionNumber]?.SessionName === "RACE") {
      // If the flags are transitioning from caution waving to caution, emit pace start event
      if (flagHasCautionWaving(this.previousFlags) && flagHasCaution(flags)) {
        this.emit(CautionExtenderEvents.PaceStart);
      }

      // If it's a race session, and we get one to green under caution, emit extension event.
      if (flagHasOneToGreen(flags) && flagHasCaution(flags)) {
        this.emit(CautionExtenderEvents.Extension);
      }
    }

    this.previousFlags = flags;
  };
}

export default CautionExtender;
