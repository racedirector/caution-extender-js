import {
  iRacingSocket,
  iRacingSocketOptions,
  iRacingSocketConsumer,
  Flags,
} from "iracing-socket-js";
import { intersection, isEmpty } from "lodash";

export const IRACING_REQUEST_PARAMS: string[] = [
  "SessionFlags",
  "SessionInfo",
  "SessionNum",
  "SessionTime",
];

export enum CautionExtenderEvents {
  PaceStart = "paceStart",
  Extension = "extension",
}

const flagHasCaution = (flagValue: number) =>
  (flagValue & Flags.Caution) === Flags.Caution;
const flagHasCautionWaving = (flagValue: number) =>
  (flagValue & Flags.CautionWaving) === Flags.CautionWaving;

const EXTENSION_REQUIRED_FLAGS = Flags.OneLapToGreen | Flags.Caution;
const extensionRequired = (flagValue: number) =>
  (flagValue & EXTENSION_REQUIRED_FLAGS) === EXTENSION_REQUIRED_FLAGS;

export interface CautionExtenderOptions {
  socket?: iRacingSocket | iRacingSocketOptions;
}

export class CautionExtender extends iRacingSocketConsumer {
  private previousFlags: number;

  constructor({ socket }: CautionExtenderOptions) {
    super(socket);
  }

  onUpdate = (keys) => {
    if (isEmpty(intersection(keys, ["SessionFlags", "SessionNum"]))) {
      return;
    }

    const {
      SessionFlags: flags = -1,
      SessionNum: sessionNumber = -1,
      SessionInfo: sessionInfo = {},
    } = this.socket.data;

    if (sessionInfo?.Sessions?.[sessionNumber]?.SessionName === "RACE") {
      // If the flags are transitioning from caution waving to caution, emit pace start event
      if (flagHasCautionWaving(this.previousFlags) && flagHasCaution(flags)) {
        this.emit(CautionExtenderEvents.PaceStart);
      }

      // If it's a race session, and we get one to green under caution, emit extension event.
      if (extensionRequired(flags)) {
        this.emit(CautionExtenderEvents.Extension);
      }
    }

    this.previousFlags = flags;
  };
}

export default CautionExtender;
