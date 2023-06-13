import { Routes, fetchRoute } from "./routes";
import zod from 'zod';
import type { GetSheetNamesOptions, ScheduleGeneratorOptions } from "./schemas";

export const stringArraySchema = zod.string().array(); 

export async function getSheetNames(options: GetSheetNamesOptions): Promise<string[]> {
  const resp = await fetchRoute(Routes.GET_SHEET_NAMES, options);
  if (!resp.ok) throw new Error(await resp.text());

  return stringArraySchema.parse(await resp.json());
}

export async function executeGenerator(options: ScheduleGeneratorOptions): Promise<ArrayBuffer> {
  const resp = await fetchRoute(Routes.SCHEDULE_GENERATOR, options);
  if (!resp.ok) throw new Error(await resp.text());

  return resp.arrayBuffer();
}