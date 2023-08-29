import zod from 'zod';
import { Config } from '../utils/config';
import { firestore } from 'firebase-admin';
import { Collection, UpdateInfoHandler } from '.';

export const holidaySchema = zod.object({
  name: zod.string(),
  day: zod.number(),
  month: zod.number(),
});

export interface HolidayType extends zod.infer<typeof holidaySchema> { };

export type HolidaysRepositoryConfig = Config<{
  holidaysCollection: firestore.CollectionReference;
}>;

export class HolidaysFirestoreRepository {
  static createConfig = Config.createStaticFactory<HolidaysRepositoryConfig>({
    holidaysCollection: Collection.holidays,
  });
  readonly config: Config.From<HolidaysRepositoryConfig>;

  constructor(config: Config.Partial<HolidaysRepositoryConfig> = {}) {
    this.config = HolidaysFirestoreRepository.createConfig(config);
  }

  async get(id: string): Promise<HolidayType> {
    const resp = await this.config.holidaysCollection.doc(id).get();

    return holidaySchema.parse(resp.data());
  }

  async getUpdateInfo() {
    return UpdateInfoHandler.fromCollectionRef(this.config.holidaysCollection);
  }

  async releaseNewVersion() {
    return UpdateInfoHandler.releaseNewVersionTo(this.config.holidaysCollection);
  }

  async getAll(): Promise<HolidayType[]> {
    const resp = await this.config.holidaysCollection.get();
    if (resp.empty) return [];

    return resp.docs
      .filter(doc => !doc.id.startsWith('@'))
      .map(doc => holidaySchema.parse(doc.data()));
  }

  async update(data: Partial<HolidayType> & Pick<HolidayType, 'day' | 'month'>) {
    const resp = await this.config.holidaysCollection
      .doc(HolidaysFirestoreRepository.idFromHoliday(data))
      .update(data);

    await this.releaseNewVersion();

    return resp;
  }

  async create(holiday: HolidayType) {
    const resp = await this.config.holidaysCollection
      .doc(HolidaysFirestoreRepository.idFromHoliday(holiday))
      .create(holiday);

    await this.releaseNewVersion();

    return resp;
  }

  static idFromHoliday(holiday: Pick<HolidayType, 'day' | 'month'>) {
    return `${holiday.day}-${holiday.month}`;
  }
}