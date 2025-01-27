export type ScheduleFileType =
  | "ordinary"
  | "payment"
  | "divulgation"
  | "json"
  | "unknown";

export interface ScheduleFileInfo {
  type: ScheduleFileType;
}

export * from "./in";
export * from "./out";
