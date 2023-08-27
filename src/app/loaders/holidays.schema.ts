import zod from 'zod';

export const holidaySchema = zod.object({
  name: zod.string(),
  day: zod.number(),
  month: zod.number(),
});

export type HolidayType = zod.infer<typeof holidaySchema>;

