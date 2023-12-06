import { expect, test } from '@jest/globals';
import { DutyData, TableData } from '../../../app/api/table-reactive-edition/table';
import { DispatcherType, Searcher, TableEditorController } from './table-editor';

function mockDuties(numOfDays: number, dutyCapacity: number): DutyData[] {
  const duties: DutyData[] = [];
  let idCount = 1;

  for (let day = 0; day < numOfDays; day++) {
    for (let index = 0; index < dutyCapacity; index++) {
      duties.push({
        day,
        index,
        id: idCount++,
      });
    }
  }

  return duties;
}

function mockTable(): TableData {
  const dutyCapacity = 2;
  const numOfDays = 30;

  return {
    duties: mockDuties(numOfDays, dutyCapacity),
    config: { dutyCapacity, month: 11, numOfDays, year: 2023 },
    dutyAndWorkerRelationships: [],
    idCounters: new Map(),
    workers: [],
  };
}

const dispatcherMock: DispatcherType = null as any;

test('#next method shild return next duty', () => {
  const table: TableData = mockTable();

  const tableController = new TableEditorController({ table, dispatcher: dispatcherMock });

  const dutyController = tableController.findDuty(
    Searcher.duty.dayEquals(0),
    Searcher.duty.indexEquals(1),
  );
  if (!dutyController) throw new Error(`Can't find duty`);

  const nextDutyController = dutyController.next();

  expect(nextDutyController.duty.day).toEqual(1);
  expect(nextDutyController.duty.index).toEqual(0);
});