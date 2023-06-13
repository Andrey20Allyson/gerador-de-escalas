import type { GetSheetNamesOptions, ScheduleGeneratorOptions } from './schemas';

export enum Routes {
  ROOT = '/api',
  SCHEDULE_GENERATOR = `${ROOT}/schedule-generator`,
  GET_SHEET_NAMES = `${ROOT}/get-sheet-names`,
}

export type RouteOptionsMap = {
  [Routes.GET_SHEET_NAMES]: GetSheetNamesOptions;
  [Routes.SCHEDULE_GENERATOR]: ScheduleGeneratorOptions;
}

export function fetchRoute<R extends keyof RouteOptionsMap>(route: R, options: RouteOptionsMap[R]) {
  const params = new URLSearchParams(options);
  return fetch(`${route}?${params.toString()}`);
}