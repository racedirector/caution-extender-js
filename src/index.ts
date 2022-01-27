import {
  iRacingData,
  iRacingSocket,
  iRacingSocketEvents,
} from "iracing-socket-js";
import { EventEmitter } from "events";
import { pickBy } from "lodash";
import {
  checkForIncidents,
  DriverIndex,
  getTelemetryIncidents,
  indexDriverList,
  telemetryFromData,
  TelemetryIncidentMeta,
} from "utils";

export enum RaceDirectorEvents {
  Caution = "caution",
  Incident = "incident",
}

export enum IncidentType {
  Sim = "sim",
  Telemetry = "telemetry",
}

export interface Incident {
  type: IncidentType;
  carIdx: number;
  driverId: string;
  lapPercentage: number;
  simTime: string;
  sessionTime: string;
  value: number;
  context?: Record<string, any>;
}

const TELEMETRY_KEYS = [
  "CarIdxGear",
  "CarIdxLapDistPct",
  "CarIdxOnPitRoad",
  "CarIdxRPM",
  "CarIdxTrackSurface",
  "CarIdxTrackSurfaceMaterial",
];

export interface RaceDirectorOptions {
  server: string;
}

export class RaceDirector extends EventEmitter {
  private socket: iRacingSocket;

  private driverIndex: DriverIndex = {};

  private trackLength: number = -1;

  private previousData: iRacingData;

  constructor(options?: RaceDirectorOptions) {
    super();

    this.on(RaceDirectorEvents.Incident, (driver, count) => {
      console.log(`Driver ${driver.UserID} had an incident worth ${count}`);
    });

    // eslint-disable-next-line new-cap
    this.socket = new iRacingSocket({
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

    this.socket.addListener(iRacingSocketEvents.Update, this.onUpdate);
  }

  private onUpdate = (keys: string[]) => {
    const newData = this.socket.data;
    const updates = pickBy(newData, (value, key) => keys.includes(key));

    if (updates.DriverInfo) {
      const driverIndex = indexDriverList(newData.DriverInfo?.Drivers || []);
      this.checkSimIncidents();
      this.driverIndex = driverIndex;
    }

    if (updates.WeekendInfo) {
      const trackLength =
        updates.WeekendInfo?.TrackLength?.replace(" km", "") || null;
      this.trackLength = trackLength ? parseFloat(trackLength) * 1000 : -1;
    }

    const carIndexes = Object.keys(this.driverIndex)
      .map((keyString) => parseInt(keyString, 10))
      .filter(Boolean);

    this.checkTelemetryIncidents(newData, carIndexes, this.trackLength);
    this.previousData = newData;
  };

  private checkTelemetryIncidents = (
    data: iRacingData,
    indexes: number[],
    trackLength: number,
  ) => {
    indexes
      .flatMap((carIndex): TelemetryIncidentMeta & { carIndex: number } => {
        const previousTelemetry = telemetryFromData(
          this.previousData,
          carIndex,
        );

        if (previousTelemetry) {
          const currentTelemetry = telemetryFromData(data, carIndex);

          return {
            carIndex,
            ...getTelemetryIncidents(
              currentTelemetry,
              previousTelemetry,
              trackLength,
            ),
          };
        }

        return null;
      })
      .filter(({ stationary, reverse, slow, wrongWay, onTrack }) => {
        return stationary || slow || (wrongWay && onTrack) || reverse;
      });
  };

  private checkSimIncidents = (data: iRacingData) => {
    const previousDriverIndex = indexDriverList(
      this.previousData?.DriverInfo?.Drivers || [],
    );

    checkForIncidents(
      previousDriverIndex,
      this.driverIndex,
      (driver, carIndex, count) => {
        const incident: Incident = {
          type: IncidentType.Sim,
          carIdx: carIndex,
          driverId: driver.UserID,
          lapPercentage: data.CarIdxLapDistPct?.[carIndex],
          value: count,
        };
        this.emit(RaceDirectorEvents.Incident);
      },
    );
  };
}

export default RaceDirector;
