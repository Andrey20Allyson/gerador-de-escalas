import {
  ExtraDuty,
  ExtraDutyTable,
  ExtraDutyTableEntry,
  ExtraEventName,
  Graduation,
} from "../../../extra-duty-lib";
import { enumerate } from "../../../../utils";
import { ScheduleMetadataWriter } from "../../lib/metadata/schedule-metatada-writer";
import { SerializationStratergy } from "../serialization-stratergy";
import ExcelJS from "exceljs";

export class PaymentSerializationStratergy implements SerializationStratergy {
  private cachedBook?: Promise<ExcelJS.Workbook>;

  constructor(
    readonly buffer: Buffer | ArrayBuffer,
    readonly sheetName: string,
  ) {}

  async createBook() {
    const book = new ExcelJS.Workbook();
    await book.xlsx.load(this.buffer);

    return book;
  }

  async createCache() {
    this.cachedBook = this.createBook();

    return this.cachedBook;
  }

  getCachedBook() {
    if (!this.cachedBook) return;

    const book = this.cachedBook;
    delete this.cachedBook;

    return book;
  }

  async getBook() {
    const cachedBook = this.getCachedBook();
    if (cachedBook) return cachedBook;

    return this.createBook();
  }

  async execute(table: ExtraDutyTable): Promise<Buffer> {
    const book = await this.getBook();

    const sheet = book.getWorksheet(this.sheetName);
    if (sheet == null) {
      throw new Error(`sheet '${this.sheetName}' do not exists!`);
    }

    const yearCell = sheet.getCell("C6");

    yearCell.value = table.config.year;

    const monthCell = sheet.getCell("C7");

    monthCell.value = table.config.month + 1;

    for (const [i, rowData] of enumerate(iterRows(table))) {
      const row = sheet.getRow(i + 15);

      const nameCell = row.getCell(OutputCollumns.NAME);
      const registrationCell = row.getCell(OutputCollumns.REGISTRATION);
      const gradCell = row.getCell(OutputCollumns.GRAD);
      const dateCell = row.getCell(OutputCollumns.DATE);
      const startTimeCell = row.getCell(OutputCollumns.START_TIME);
      const endTimeCell = row.getCell(OutputCollumns.END_TIME);

      const eventCell = row.getCell(OutputCollumns.EVENT);
      const detailsCell = row.getCell(OutputCollumns.DETAILS);
      const IRCell = row.getCell(OutputCollumns.ITIN);
      const locationCodeCell = row.getCell(OutputCollumns.LOCATION_CODE);

      locationCodeCell.value = 7;
      eventCell.value = rowData.event;
      detailsCell.value = "SEGURANÇA E APOIO A SMAS";

      nameCell.value = rowData.name;
      registrationCell.value = rowData.registration;
      gradCell.value = rowData.grad;
      dateCell.value = rowData.date;
      startTimeCell.value = rowData.startTime;
      endTimeCell.value = rowData.endTime;
      IRCell.value = rowData.individualRegistry;
    }

    await ScheduleMetadataWriter.into(book).write(table);

    return Buffer.from(await book.xlsx.writeBuffer());
  }
}

enum OutputCollumns {
  NAME = "B",
  REGISTRATION = "C",
  GRAD = "H",
  DATE = "I",
  START_TIME = "J",
  END_TIME = "K",
  ITIN = "D",
  EVENT = "F",
  LOCATION_CODE = "E",
  DETAILS = "G",
}

const GRAD_SORT_MAP = new Map<string, number>([
  ["GCM", 3],
  ["SI", 2],
  ["INSP", 1],
]);

interface ExtraXLSXTableRow {
  name: string;
  grad: string;
  registration: number;
  date: Date;
  event: string;
  startTime: number;
  endTime: number;
  individualRegistry: number;
}

const PAYMENT_GRADUATION_MAP = new Map<Graduation, string>([
  ["gcm", "GCM"],
  ["sub-insp", "SI"],
  ["insp", "INSP"],
]);

function parseGraduationToPayment(graduation: Graduation): string {
  const parsed = PAYMENT_GRADUATION_MAP.get(graduation);
  if (parsed === undefined)
    throw new Error(
      `Payment Schedule generator can't find grad for '${graduation}'`,
    );

  return parsed;
}

function eventFromDuty(duty: ExtraDuty): string {
  switch (duty.config.currentPlace) {
    case ExtraEventName.JARDIM_BOTANICO_DAYTIME:
      return "JARDIM BOTÂNICO APOIO AS AÇÔES DIURNAS";
    case ExtraEventName.JIQUIA:
      return "PARQUE DO JIQUIÁ";
    case ExtraEventName.SUPPORT_TO_CITY_HALL:
      return "EVENTOS DE APOIO A PREFEITURA";
  }

  throw new Error(
    `Can't find a event name for place '${duty.config.currentPlace}'`,
  );
}

function sortByDaytimeAndNighttime(
  entry1: ExtraDutyTableEntry,
  entry2: ExtraDutyTableEntry,
): number {
  return +entry1.duty.isNighttime() - +entry2.duty.isNighttime();
}

const EXTRA_EVENT_SORT_VALUES = new Map<string, number>([
  [ExtraEventName.JIQUIA, 1],
  [ExtraEventName.JARDIM_BOTANICO_DAYTIME, 2],
  [ExtraEventName.SUPPORT_TO_CITY_HALL, 3],
]);

function sortPlaceByCorrectOrder(placeA: string, placeB: string): number {
  const a =
    EXTRA_EVENT_SORT_VALUES.get(placeA) ?? EXTRA_EVENT_SORT_VALUES.size + 1;
  const b =
    EXTRA_EVENT_SORT_VALUES.get(placeB) ?? EXTRA_EVENT_SORT_VALUES.size + 1;

  return a - b;
}

function* iterRows(table: ExtraDutyTable): Iterable<ExtraXLSXTableRow> {
  const places = [...table.iterPlaces()].sort(sortPlaceByCorrectOrder);

  for (const place of places) {
    table.config.currentPlace = place;

    const entries = Array.from(table.entries());

    entries.sort(sortByRegistration);

    entries.sort(sortByGrad);

    if (place === ExtraEventName.JARDIM_BOTANICO_DAYTIME)
      entries.sort(sortByDaytimeAndNighttime);

    for (const entry of entries) {
      const startTime = (entry.duty.start % 24) / 24;
      const endTime = (entry.duty.end % 24) / 24;
      const date = new Date(
        entry.day.config.year,
        entry.day.config.month,
        entry.day.index + 1,
      );

      const workerConfig = entry.worker.config;

      const name = workerConfig.name;
      const registration = workerConfig.identifier.id;
      const grad = parseGraduationToPayment(workerConfig.graduation);
      const individualRegistry = workerConfig.individualId;

      yield {
        date,
        endTime,
        grad,
        name,
        individualRegistry,
        registration,
        startTime,
        event: eventFromDuty(entry.duty),
      };
    }
  }
}

function getGradNum(grad: string) {
  return GRAD_SORT_MAP.get(grad) ?? GRAD_SORT_MAP.size + 1;
}

function sortByGrad(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return (
    getGradNum(a.worker.config.graduation) -
    getGradNum(b.worker.config.graduation)
  );
}

function sortByRegistration(a: ExtraDutyTableEntry, b: ExtraDutyTableEntry) {
  return a.worker.id - b.worker.id;
}
