import {
  WorkerRegistryRule,
  WorkerRegistryRuleTag,
} from "../../../persistence/entities/worker-registry";
import { DaysOfWork } from "../days-of-work";
import { Limitable } from "../limitable";
import { WorkLimit } from "../work-limit";
import { WorkTime } from "../work-time";
import { WorkerIdentifier } from "../worker-identifier";

export interface WorkerInfoConfig {
  readonly name: string;
  readonly post: string;
  readonly graduation: Graduation;
  readonly gender: Gender;
  readonly identifier: WorkerIdentifier;
  readonly individualId: number;
  readonly daysOfWork: DaysOfWork;
  readonly workTime: WorkTime;
  limit?: WorkLimit;
}

export interface Clonable<T> {
  clone(): T;
}

export type WorkerToMapEntryCallback = (
  this: typeof WorkerInfo,
  worker: WorkerInfo,
) => [number, WorkerInfo];

export type Graduation = "sub-insp" | "insp" | "gcm";
export type Gender = "N/A" | "female" | "male";

export class WorkerInfo implements Limitable, Clonable<WorkerInfo> {
  protected readonly _rules: Map<WorkerRegistryRuleTag, WorkerRegistryRule[]>;
  readonly id: number;
  readonly limit: WorkLimit;
  readonly identifier: WorkerIdentifier;
  readonly name: string;
  readonly gender: Gender;
  readonly daysOfWork: DaysOfWork;
  readonly graduation: Graduation;
  readonly workTime: WorkTime;

  constructor(readonly config: WorkerInfoConfig) {
    this.identifier = config.identifier;
    this.name = this.config.name;
    this.daysOfWork = this.config.daysOfWork;
    this.workTime = this.config.workTime;
    this.limit = config.limit ?? new WorkLimit();

    this.graduation = config.graduation;
    this.gender = config.gender;

    this.id = this.identifier.id;

    this._rules = new Map();
  }

  addRules(rules: Iterable<WorkerRegistryRule> = []): void {
    for (const rule of rules) {
      let ruleStack = this._rules.get(rule.tag);

      if (ruleStack == null) {
        ruleStack = [];

        this._rules.set(rule.tag, ruleStack);
      }

      ruleStack.push(rule);
    }
  }

  getRuleStack<Rule extends WorkerRegistryRule = WorkerRegistryRule>(
    tag: Rule["tag"],
  ): Array<Rule> | undefined {
    const ruleStack = this._rules.get(tag) as Array<Rule> | undefined;

    return ruleStack;
  }

  *iterRules(): Iterable<WorkerRegistryRule> {
    for (const ruleStack of this._rules.values()) {
      for (const rule of ruleStack) {
        yield rule;
      }
    }
  }

  isGraduate() {
    return this.isInsp() || this.isSubInsp();
  }

  isInsp(): boolean {
    return this.graduation === "insp";
  }

  isSubInsp(): boolean {
    return this.graduation === "sub-insp";
  }

  isDailyWorker(): boolean {
    return this.daysOfWork.isDailyWorker;
  }

  clone() {
    const {
      daysOfWork,
      graduation: grad,
      individualId,
      name,
      post,
      workTime,
      gender,
      identifier,
    } = this.config;

    const config: WorkerInfoConfig = {
      daysOfWork: daysOfWork.clone(),
      workTime: workTime.clone(),
      individualId,
      identifier,
      gender,
      graduation: grad,
      name,
      post,
    };

    const clone = new WorkerInfo(config);

    clone.addRules(this.iterRules());

    return clone;
  }

  static mapFrom(workers: WorkerInfo[]): Map<number, WorkerInfo> {
    return new Map(workers.map((worker) => [worker.id, worker] as const));
  }
}

export * from "./parser";
