import { Gender, Graduation, WorkerInfo } from ".";
import { parseNumberOrThrow } from "src/utils";
import { Parser } from "../base/parser";
import { DEFAULT_DAYS_OF_WORK_PARSER, DaysOfWork } from "../days-of-work";
import {
  LicenseInterval,
  LicenseIntervalParser,
} from "../days-of-work/license-interval";
import { WorkLimit } from "../work-limit";
import { WorkLimitParser } from "../work-limit/parser";
import { WorkTime } from "../work-time";
import { WorkTimeParser } from "../work-time/parser";
import { WorkerIdentifier } from "../worker-identifier";
import { WorkerIdentifierParser } from "../worker-identifier/parser";
import { Month } from "../month";

export interface WorkerInfoParseData {
  month: Month;

  name: string;
  post: string;
  grad: string;
  hourly: string;
  gender?: string;
  workerId: string;
  individualId?: string;
  workLimit?: string;
}

export interface WorkerInfoParserOptions {
  daysOfWorkParser?: Parser<WorkerInfoParseData, DaysOfWork>;
  workTimeParser?: Parser<WorkerInfoParseData, WorkTime>;
  identifierParser?: Parser<WorkerInfoParseData, WorkerIdentifier>;
  workLimitParser?: Parser<WorkerInfoParseData, WorkLimit>;
  licenseParser?: Parser<string, LicenseInterval | null>;
}

export interface LicenseOption {
  license?: LicenseInterval | null;
}

export class WorkerInfoParser {
  private readonly genderMap: NodeJS.Dict<Gender> = {
    F: "female",
    M: "male",
  };

  private readonly graduationMap: NodeJS.Dict<Graduation> = {
    INSP: "insp",
    GCM: "gcm",
    SI: "sub-insp",
  };

  readonly daysOfWorkParser: Parser<
    WorkerInfoParseData & LicenseOption,
    DaysOfWork
  >;
  readonly workTimeParser: Parser<
    WorkerInfoParseData & LicenseOption,
    WorkTime
  >;
  readonly identifierParser: Parser<WorkerInfoParseData, WorkerIdentifier>;
  readonly workLimitParser: Parser<WorkerInfoParseData, WorkLimit>;
  readonly licenseParser: Parser<string, LicenseInterval | null>;

  constructor(options?: WorkerInfoParserOptions) {
    this.daysOfWorkParser =
      options?.daysOfWorkParser ?? DEFAULT_DAYS_OF_WORK_PARSER;
    this.workTimeParser = options?.workTimeParser ?? new WorkTimeParser();
    this.identifierParser =
      options?.identifierParser ?? new WorkerIdentifierParser();
    this.workLimitParser = options?.workLimitParser ?? new WorkLimitParser();
    this.licenseParser = options?.licenseParser ?? new LicenseIntervalParser();
  }

  parse(data: WorkerInfoParseData): WorkerInfo | null {
    if (
      ["FÉRIAS", "DISP. MÉDICA MÊS"].some((skipLabel) =>
        data.post.includes(skipLabel),
      )
    )
      return null;
    if (
      ["LICENÇA PRÊMIO", "LIC. PRÊMIO"].some(
        (skipLabel) => data.hourly.trim().toUpperCase() === skipLabel,
      )
    )
      return null;

    const license = this.licenseParser.parse(data.hourly);
    const workTime = this.workTimeParser.parse({ ...data, license });
    const daysOfWork = this.daysOfWorkParser.parse({ ...data, license });

    if (daysOfWork.hasDaysOff() === false) {
      return null;
    }

    const identifier = this.identifierParser.parse(data);
    const limit = this.workLimitParser.parse(data);

    return new WorkerInfo({
      name: data.name,
      post: data.post,
      workTime,
      limit,
      daysOfWork,
      identifier,
      graduation: this.parseGradutation(data.grad),
      gender: this.parseGender(data.gender ?? "U"),
      individualId:
        data.individualId !== undefined
          ? parseNumberOrThrow(data.individualId.replace(/\.|\-/g, ""))
          : 0,
    });
  }

  parseGender(gender?: string): Gender {
    if (gender === undefined) return "N/A";

    return this.genderMap[gender] ?? "N/A";
  }

  parseGradutation(grad: string): Graduation {
    return (
      this.graduationMap[grad] ??
      raise(new Error(`Unknow graduation named '${grad}'!`))
    );
  }
}

function raise(error: unknown): never {
  throw error;
}

export const DEFAULT_WORKER_INFO_PARSER = new WorkerInfoParser();
