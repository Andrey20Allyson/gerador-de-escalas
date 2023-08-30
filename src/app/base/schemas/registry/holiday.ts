import zod from 'zod';

export const holidaySchema = zod.object({
  name: zod.string(),
  day: zod.number(),
  month: zod.number(),
});

export interface HolidayType extends zod.infer<typeof holidaySchema> { };