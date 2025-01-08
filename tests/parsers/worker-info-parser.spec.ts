import { describe, expect, test } from "vitest";
import { Month, WorkerInfo, WorkerInfoParser } from "src/lib/structs";
import { randomIntFromInterval } from "src/utils";

describe(WorkerInfoParser.name, () => {
  describe(WorkerInfoParser.prototype.parse.name, () => {
    const licenseStr = "LICENÇA PRÊMIO";

    test(`Shold return null if hourly is equals to '${licenseStr}'`, () => {
      const parser = new WorkerInfoParser();
      let worker: WorkerInfo | null;

      try {
        worker = parser.parse({
          grad: "CGM",
          hourly: licenseStr,
          month: new Month(
            randomIntFromInterval(2000, 3000),
            randomIntFromInterval(0, 11),
          ),
          name: "John Due",
          post: licenseStr,
          workerId: "14242-43",
        });
      } catch {
        expect.fail(`Expected a return, but it throwned`);
      }

      expect(worker).toBeNull();
    });
  });
});
