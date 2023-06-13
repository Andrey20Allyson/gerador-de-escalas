import zod from 'zod';

export const getSheetNamesOptionsSchema = zod.object({
  filePath: zod.string(),
});

export const scheduleGeneratorOptionsSchema = zod.object({
  sheetName: zod.string(),
  filePath: zod.string(),
  month: zod.string(),
});

export type ScheduleGeneratorOptions = zod.infer<typeof scheduleGeneratorOptionsSchema>;
export type GetSheetNamesOptions = zod.infer<typeof getSheetNamesOptionsSchema>;