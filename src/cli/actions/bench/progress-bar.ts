import chalk from "chalk";

export type ValuePerTimeScala = "min" | "sec" | "milli";
export type ValuesPerTimeAvg = "higher" | "lower" | "mid";
export type NumberMapper = (value: number) => number;

export class ValuesPerTimeEntry {
  constructor(
    readonly valuesPerTime: number,
    readonly difToPrev: number,
    readonly scala: ValuePerTimeScala,
    readonly avg: ValuesPerTimeAvg = "mid",
  ) {}

  private _avgColor(): chalk.Chalk {
    switch (this.avg) {
      case "higher":
        return chalk.greenBright;
      case "lower":
        return chalk.redBright;
      case "mid":
        return chalk.white;
    }
  }

  private _difToPrevColor(): chalk.Chalk {
    const dif = this.difToPrev;

    if (dif < 0) {
      return chalk.redBright;
    }

    if (dif > 0) {
      return chalk.greenBright;
    }

    return chalk.yellow;
  }

  toString(): string {
    const difColor = this._difToPrevColor();
    const avgColor = this._avgColor();

    return `[Values per ${this.scala}: ${avgColor(this.valuesPerTime.toFixed(2))}; dif to prev: ${difColor(this.difToPrev.toFixed(2))}]`;
  }

  setAvg(avg: ValuesPerTimeAvg): ValuesPerTimeEntry {
    return new ValuesPerTimeEntry(
      this.valuesPerTime,
      this.difToPrev,
      this.scala,
      avg,
    );
  }

  static higherOrLower(entry: ValuesPerTimeEntry): boolean {
    return entry.avg === "higher" || entry.avg === "lower";
  }
}

export class ProgressBar {
  readonly percOfTotal: number;
  private lastTime: number;
  private difs: number[] = [];

  constructor(
    readonly total: number,
    step: number = 0.05,
  ) {
    step = Math.max(step, 1 / this.total, 0.01);

    this.percOfTotal = Math.round(this.total * step);
    this.lastTime = Date.now();
  }

  start() {
    this.lastTime = Date.now();
  }

  captureDiff(): number {
    const now = Date.now();
    const dif = now - this.lastTime;
    this.lastTime = now;

    this.difs.push(dif);

    return dif;
  }

  getDifs(): number[] {
    return [...this.difs];
  }

  getValuesPer(
    scala: ValuePerTimeScala,
    mapper?: NumberMapper,
  ): ValuesPerTimeEntry[] {
    let prevVPT: number | undefined;
    let higger: ValuesPerTimeEntry | undefined;
    let lower: ValuesPerTimeEntry | undefined;

    return this.getDifs()
      .map((dif) => {
        let mult = 1;
        switch (scala) {
          case "min":
            mult = 1000 * 60;
          case "sec":
            mult = 1000;
        }

        const valuesPerTime = (this.percOfTotal / dif) * mult;

        const mappedVPT =
          mapper !== undefined ? mapper(valuesPerTime) : valuesPerTime;
        const entry = new ValuesPerTimeEntry(
          mappedVPT,
          valuesPerTime - (prevVPT ?? 0),
          scala,
        );

        prevVPT = valuesPerTime;

        if (higger === undefined) {
          higger = entry;
        }

        if (entry.valuesPerTime > higger.valuesPerTime) {
          higger = entry;
        }

        if (lower === undefined) {
          lower = entry;
        }

        if (entry.valuesPerTime < lower.valuesPerTime) {
          lower = entry;
        }

        return entry;
      })
      .map((entry) => {
        if (entry === higger) {
          return entry.setAvg("higher");
        }

        if (entry === lower) {
          return entry.setAvg("lower");
        }

        return entry;
      });
  }

  update(value: number) {
    const { stdout } = process;

    if (value >= this.total) {
      this.captureDiff();

      stdout.cursorTo(0);
      stdout.clearLine(0);
      stdout.write(`[ ${chalk.greenBright("Completed")} ]\n`);
      return;
    }

    if (value % this.percOfTotal !== 0) {
      return;
    }

    this.captureDiff();

    const perc = Math.max(Math.min(value / this.total, 1), 0);
    const count = Math.round(10 * perc);

    stdout.cursorTo(0);
    stdout.clearLine(0);
    stdout.write(
      `[ ${chalk.greenBright("#".repeat(count))}${chalk.grey("#".repeat(10 - count))} ${(perc * 100).toFixed(0)}% ]`,
    );
  }
}
