import { firestore } from 'firebase-admin';
import zod from 'zod';
import { RegistryEntryType } from '../base';
import { Config } from '../utils/config';
import { Collection } from './firestore';
import { UpdateInfoHandler } from './update-info';

export const holidaySchema = zod.object({
  name: zod.string(),
  day: zod.number(),
  month: zod.number(),
});

export interface HolidayType extends zod.infer<typeof holidaySchema> { };

export type HolidaysRepositoryConfig = Config<{
  collection: firestore.CollectionReference;
}>;

export class HolidaysFirestoreRepository {
  static createConfig = Config.createStaticFactory<HolidaysRepositoryConfig>({
    collection: Collection.holidays,
  });
  readonly config: Config.From<HolidaysRepositoryConfig>;

  constructor(config: Config.Partial<HolidaysRepositoryConfig> = {}) {
    this.config = HolidaysFirestoreRepository.createConfig(config);
  }

  get collection() {
    return this.config.collection;
  }

  async get(id: string): Promise<RegistryEntryType<HolidayType>> {
    const doc = await this.config.collection.doc(id).get();

    return {
      id: doc.id,
      data: holidaySchema.parse(doc.data())
    };
  }

  async getUpdateInfo() {
    return UpdateInfoHandler.fromCollectionRef(this.config.collection);
  }

  async releaseNewVersion() {
    return UpdateInfoHandler.releaseNewVersionTo(this.config.collection);
  }

  async getAll(): Promise<RegistryEntryType<HolidayType>[]> {
    const resp = await this.config.collection.get();
    if (resp.empty) return [];

    return resp.docs
      .filter(doc => !doc.id.startsWith('@'))
      .map(doc => ({ id: doc.id, data: holidaySchema.parse(doc.data()) }));
  }

  async update(data: Partial<HolidayType> & Pick<HolidayType, 'day' | 'month'>) {
    const resp = await this.config.collection
      .doc(HolidaysFirestoreRepository.idFromHoliday(data))
      .update(data);

    await this.releaseNewVersion();

    return resp;
  }

  async create(holiday: HolidayType) {
    const resp = await this.config.collection
      .doc(HolidaysFirestoreRepository.idFromHoliday(holiday))
      .create(holiday);

    await this.releaseNewVersion();

    return resp;
  }

  static idFromHoliday(holiday: Pick<HolidayType, 'day' | 'month'>) {
    return `${holiday.day}-${holiday.month}`;
  }
}