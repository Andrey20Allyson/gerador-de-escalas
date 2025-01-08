import { describe, expect, test } from "vitest";
import { ExtraDuty } from "src/lib/structs/extra-duty";
import { mock } from "../mocking/mocker";

describe(ExtraDuty.name, () => {
  describe(ExtraDuty.prototype.getSize.name, () => {
    test(`Shold return the number of workers in the duty`, () => {
      const { duty, table } = mock();

      duty.add(mock.worker({ table }));
      duty.add(mock.worker({ table }));
      duty.add(mock.worker({ table }));

      expect(duty.getSize()).toStrictEqual(3);
    });
  });
});
