import { EventEmitter } from "events";
import { Flags, iRacingSocket, iRacingSocketEvents } from "iracing-socket-js";
import { CautionExtender, CautionExtenderEvents } from "./index";

class MockIRacingSocket extends EventEmitter {
  data: any;

  constructor() {
    super();
    this.data = {};
  }
}

const mockIRacingSocket = Object.assign(
  Object.create(iRacingSocket.prototype),
  new MockIRacingSocket(),
);

const DEFAULT_FLAGS = Flags.StartHidden;

const DEFAULT_SOCKET_DATA = {
  SessionFlags: DEFAULT_FLAGS,
  SessionNum: 0,
  SessionInfo: {
    Sessions: [
      {
        SessionName: "RACE",
      },
    ],
  },
};

const CAUTION_WAVING_SOCKET_DATA = {
  ...DEFAULT_SOCKET_DATA,
  SessionFlags: DEFAULT_FLAGS | Flags.CautionWaving,
};

const CAUTION_SOCKET_DATA = {
  ...DEFAULT_SOCKET_DATA,
  SessionFlags: DEFAULT_FLAGS | Flags.Caution,
};

const EXTENSION_SOCKET_DATA = {
  ...DEFAULT_SOCKET_DATA,
  SessionFlags: Flags.Caution | Flags.OneLapToGreen,
};

describe("Caution Extender", () => {
  beforeEach(() => {
    mockIRacingSocket.data = {};
  });

  it("emits pace start events", () => {
    const cautionExtender = new CautionExtender({
      socket: mockIRacingSocket,
    });

    let isEventEmitted = false;
    cautionExtender.on(CautionExtenderEvents.PaceStart, () => {
      isEventEmitted = true;
    });

    // Transition to default
    mockIRacingSocket.data = DEFAULT_SOCKET_DATA;
    mockIRacingSocket.emit(iRacingSocketEvents.Update, []);

    expect(isEventEmitted).toBeFalsy();

    // Transition to caution waving (SC deployed, line forming)
    mockIRacingSocket.data = CAUTION_WAVING_SOCKET_DATA;
    mockIRacingSocket.emit(iRacingSocketEvents.Update, []);

    expect(isEventEmitted).toBeFalsy();

    // Transition to caution is out, one lap has been completed with someone picked up by the SC.
    mockIRacingSocket.data = CAUTION_SOCKET_DATA;
    mockIRacingSocket.emit(iRacingSocketEvents.Update, []);

    expect(isEventEmitted).toBeTruthy();
  });
  it("emits events when an extension is required", () => {
    const cautionExtender = new CautionExtender({
      socket: mockIRacingSocket,
    });

    let isEventEmitted = false;
    cautionExtender.on(CautionExtenderEvents.Extension, () => {
      isEventEmitted = true;
    });

    // Transition to caution is out, two to green...
    mockIRacingSocket.data = CAUTION_SOCKET_DATA;
    mockIRacingSocket.emit(iRacingSocketEvents.Update, []);

    expect(isEventEmitted).toBeFalsy();

    // Transition to the extension state...
    mockIRacingSocket.data = EXTENSION_SOCKET_DATA;
    mockIRacingSocket.emit(iRacingSocketEvents.Update, []);

    expect(isEventEmitted).toBeTruthy();
  });
});
