import { expect, test } from "vitest";
import { ExtraDutyTable } from "src/lib/structs";
import { mock } from "tests/mocking/mocker";

test(`#clear shold restart all workers positionsLeft`, () => {
  const table = new ExtraDutyTable();

  const worker0 = mock.worker({ name: "Jose", table });
  const worker1 = mock.worker({ name: "Roberto", table });
  const worker2 = mock.worker({ name: "Cariane", table });

  const day0 = table.getDay(0);

  day0.getDuty(0).add(worker0);
  day0.getDuty(0).add(worker1);
  day0.getDuty(1).add(worker2);

  table.clear();

  expect(table.limiter.positionsOf(worker0)).toStrictEqual(0);
  expect(table.limiter.positionsOf(worker1)).toStrictEqual(0);
  expect(table.limiter.positionsOf(worker2)).toStrictEqual(0);
});
