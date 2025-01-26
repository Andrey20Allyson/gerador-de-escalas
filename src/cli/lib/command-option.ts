export interface OptionInfo {
  readonly alias?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly cliName?: string;
}

export class OptionInfoBuilder {
  private constructor(private readonly optionInfo: OptionInfo = {}) {}

  describe(description: string) {
    return new OptionInfoBuilder({
      ...this.optionInfo,
      description,
    });
  }

  alias(alias: string) {
    return new OptionInfoBuilder({
      ...this.optionInfo,
      alias,
    });
  }

  hint(hint: string) {
    return new OptionInfoBuilder({
      ...this.optionInfo,
      hint,
    });
  }

  cliName(cliName: string) {
    return new OptionInfoBuilder({
      ...this.optionInfo,
      cliName,
    });
  }

  get(): OptionInfo {
    return this.optionInfo;
  }

  static create(): OptionInfoBuilder {
    return new this();
  }

  static describe(description: string): OptionInfoBuilder {
    return new this({ description });
  }

  static alias(alias: string): OptionInfoBuilder {
    return new this({ alias });
  }

  static hint(hint: string): OptionInfoBuilder {
    return new this({ hint });
  }

  static cliName(cliName: string) {
    return new this({ cliName });
  }
}
