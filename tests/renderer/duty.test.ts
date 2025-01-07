import {
  DutyData,
  TableData,
} from "src/apploader/api/table-reactive-edition/table";
import { ExtraEventName } from "src/lib/structs";
import { DutySearcher } from "src/renderer/state/controllers/editor/searchers/duty";
import {
  DispatcherType,
  TableEditorController,
} from "src/renderer/state/controllers/editor/table";
import { expect, test } from "vitest";

function mockDuties(numOfDays: number, dutiesPerDay: number): DutyData[] {
  const duties: DutyData[] = [];
  let idCount = 1;

  for (let day = 0; day < numOfDays; day++) {
    for (let index = 0; index < dutiesPerDay; index++) {
      duties.push({
        date: {
          key: "",
          index: day,
          day,
          month: 0,
          year: 0,
        },
        end: 7,
        start: 13,
        active: true,
        key: "",
        index,
        id: idCount++,
      });
    }
  }

  return duties;
}

function mockTable(): TableData {
  const dutiesPerDay = 2;
  const numOfDays = 30;

  return {
    rules: {
      femaleRule: true,
      inspRule: true,
      ordinaryRule: true,
      timeOffRule: true,
    },
    days: [],
    duties: mockDuties(numOfDays, dutiesPerDay),
    config: {
      workerCapacity: 5,
      dutyCapacity: 3,
      month: 11,
      year: 2023,
      numOfDays,
      dutyDuration: 12,
      dutyMinDistance: 4,
      // dutyInterval: 12,
      // extraEvents: {},
      currentPlace: ExtraEventName.JIQUIA,
      dutyOffTimeToOrdinary: 12,
      dutiesPerDay,
      dutyPositionSize: 2,
      firstDutyTime: 7,
    },
    dutyAndWorkerRelationships: [],
    idCounters: {},
    workers: [],
  };
}

const dispatcherMock: DispatcherType = () => ({}) as any;

test("#next method shild return next duty", () => {
  const table: TableData = mockTable();

  const tableController = new TableEditorController({
    state: { history: [table], undoIndex: 1 },
    table,
    dispatcher: dispatcherMock,
  });

  const dutyController = tableController.findDuty(
    DutySearcher.dayIndexEquals(0).indexEquals(1),
  );
  if (!dutyController) throw new Error(`Can't find duty`);

  const nextDutyController = dutyController.next();

  expect(nextDutyController.duty.date.index).toEqual(1);
  expect(nextDutyController.duty.index).toEqual(0);
});
