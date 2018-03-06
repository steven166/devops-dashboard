
export interface BuildModel {
  status: BuildStatus;
  startTime?: string;
  expectedDuration?: number;
  duration?: number;
}

export enum BuildStatus {

  UNKNOWN = "UNKNOWN",
  QUEUED = "QUEUED",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCEED = "SUCCEED",
  FAILED = "FAILED",
  ABORTED = "ABORTED"

}
