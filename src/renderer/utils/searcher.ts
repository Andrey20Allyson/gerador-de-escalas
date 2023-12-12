export type SearchFunction<T> = (value: T) => boolean;
export type FindHandler<T> = (value: T, index: number, arr: T[]) => boolean;

export abstract class Searcher<T> {
  constructor(
    private steps: SearchFunction<T>[] = [],
  ) { }

  someMatches(value: T): boolean {
    for (const step of this.steps) {
      if (step(value) === true) return true;
    }

    return false;
  }

  everyMatches(value: T): boolean {
    for (const step of this.steps) {
      if (step(value) === false) return false;
    }

    return true;
  }

  someMatchesHandler(): FindHandler<T> {
    return value => this.someMatches(value);
  }

  everyMatchesHandler(): FindHandler<T> {
    return value => this.everyMatches(value);
  }

  protected addStep(step: SearchFunction<T>): this {
    this.steps.push(step);
    return this;
  }
}