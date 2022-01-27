import { isEmpty, reduce } from "lodash";

export type Driver = Record<string, any>;
export type DriverIndex = Record<number, Driver>;

export const indexDriverList: (drivers: Driver[]) => DriverIndex = (drivers) =>
  reduce(
    drivers,
    (index, driver) => {
      return {
        ...index,
        [driver.CarIdx]: driver,
      };
    },
    {},
  );

export type DriverIncidentCallback = (
  driver: Driver,
  carIndex: number,
  incidentCount: number,
) => void;

export const checkForIncidents = (
  previousIndex: DriverIndex,
  nextIndex: DriverIndex,
  onIncident?: DriverIncidentCallback,
) => {
  Object.entries(nextIndex).forEach(([carIndex, driver]) => {
    // If the carIndex exists in the previous index and it's the same driver, check incidents
    if (previousIndex[carIndex]) {
      const existingDriver = previousIndex[carIndex];
      const isDriverSwap = driver.UserID !== existingDriver.UserID;

      if (!isDriverSwap) {
        const incidentCount =
          driver.CurDriverIncidentCount - existingDriver.CurDriverIncidentCount;
        if (incidentCount > 0 && onIncident) {
          onIncident(driver, parseInt(carIndex, 10), incidentCount);
        }
      }
    }
  });
};

export interface Telemetry {
  isOnPitRoad: boolean;
  trackSurface: number;
  trackSurfaceMaterial: number;
  lapDistancePercentage: number;
  reverse: boolean;
  onTrack: boolean;
}

enum TrackLocation {
  NotInWorld = -1,
  OffTrack = 0,
  InPitStall = 1,
  ApproachingPits = 2,
  OnTrack = 3,
}

const isOnTrack = (location: TrackLocation) =>
  location > TrackLocation.OffTrack;

export const telemetryFromData = (data, carIdx): Telemetry | null => {
  if (!!data && !isEmpty(data)) {
    const trackSurface: TrackLocation = data.CarIdxTrackSurface?.[carIdx] || -1;

    return {
      isOnPitRoad: data.CarIdxOnPitRoad?.[carIdx] || false,
      trackSurface: trackSurface || -1,
      trackSurfaceMaterial: data.CarIdxTrackSurfaceMaterial?.[carIdx] || -1,
      lapDistancePercentage: data.CarIdxLapDistPct?.[carIdx] || -1,
      reverse: data.CarIdxGear?.[carIdx] === -1 || false,
      onTrack: isOnTrack(trackSurface),
    };
  }

  return null;
};

export const isCarSlow = (
  currentLapDistancePercentage: number,
  previousLapDistancePercentage: number,
  trackLength: number,
  threshold = 5,
): boolean => {
  const currentLapDistance = currentLapDistancePercentage * trackLength;
  const previousLapDistance = previousLapDistancePercentage * trackLength;
  const distanceDelta = currentLapDistance - previousLapDistance;
  return threshold >= distanceDelta && distanceDelta >= -threshold;
};

export const isCarStationary = (
  currentLapDistancePercentage: number,
  previousLapDistancePercentage: number,
  trackLength: number,
  isOnPitRoad: boolean,
): boolean => {
  const currentLapDistance = Math.round(
    currentLapDistancePercentage * trackLength,
  );
  const previousLapDistance = Math.round(
    previousLapDistancePercentage * trackLength,
  );

  return currentLapDistance === previousLapDistance && !isOnPitRoad;
};

export const isCarGoingWrongWay = (
  currentLapDistancePercentage: number,
  previousLapDistancePercentage: number,
  trackLength: number,
) => {
  const currentLapDistance = currentLapDistancePercentage * trackLength;
  const previousLapDistance = previousLapDistancePercentage * trackLength;
  const distanceDelta = currentLapDistance - previousLapDistance;

  return distanceDelta < 0 && distanceDelta > -100;
};

export interface TelemetryIncidentMeta {
  stationary: boolean;
  slow: boolean;
  wrongWay: boolean;
  reverse: boolean;
  onTrack: boolean;
  lapPercentage: number;
}

type TelemetryIncidentReducer = (
  current: Telemetry,
  previous: Telemetry,
  trackLength: number,
) => TelemetryIncidentMeta;

export const getTelemetryIncidents: TelemetryIncidentReducer = (
  {
    lapDistancePercentage: currentLapDistancePercentage,
    isOnPitRoad,
    reverse,
    onTrack,
  },
  { lapDistancePercentage: previousLapDistancePercentage },
  trackLength,
) => ({
  stationary: isCarStationary(
    currentLapDistancePercentage,
    previousLapDistancePercentage,
    trackLength,
    isOnPitRoad,
  ),
  slow: isCarSlow(
    currentLapDistancePercentage,
    previousLapDistancePercentage,
    trackLength,
  ),
  wrongWay: isCarGoingWrongWay(
    currentLapDistancePercentage,
    previousLapDistancePercentage,
    trackLength,
  ),
  lapPercentage: currentLapDistancePercentage,
  reverse,
  onTrack,
});
