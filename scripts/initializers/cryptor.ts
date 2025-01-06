import { Command } from "commander";
import fs from "fs/promises";
import path from "path";
import CryptorWithPassword from "../../src/utils/cryptor-with-password";
import { ProgramInitializer } from "index";

export class CryptorProgramInitializer implements ProgramInitializer {
  initialize(program: Command): void {
    const encryptCommand = program
      .command("enc <path>")
      .description("encrypt a file")
      .option("-o, --output <path>")
      .option("-p, --password <string>")
      .action(async () => {
        await CryptorProgram.load(encryptCommand).runEncrypt();
      });

    const decryptCommand = program
      .command("dec <path>")
      .description("decrypt a file")
      .option("-o, --output <path>")
      .option("-p, --password <string>")
      .action(async () => {
        await CryptorProgram.load(decryptCommand).runDecrypt();
      });
  }
}

export class CryptorProgram {
  readonly cryptor: CryptorWithPassword;
  readonly inputPath: string;
  readonly outputPath: string;

  constructor(password: string, inputPath: string, outputPath: string) {
    this.cryptor = new CryptorWithPassword({ password });
    this.inputPath = path.resolve(inputPath);
    this.outputPath = path.resolve(outputPath);
  }

  static load(command: Command): CryptorProgram {
    const outputPath = command.getOptionValue("output");
    if (typeof outputPath !== "string")
      command.error(`Error: required option 'output' hasn't recived`);

    const inputPath = command.args.at(0);
    if (inputPath === undefined) command.error(`Error: arg[0] is required`);

    const password = command.getOptionValue("password");
    if (typeof password !== "string")
      command.error(`Error: required option 'password' hasn't recived`);

    return new CryptorProgram(password, inputPath, outputPath);
  }

  readFile() {
    return fs.readFile(this.inputPath);
  }

  encrypt(data: Buffer) {
    return this.cryptor.encrypt(data);
  }

  decrypt(data: Buffer) {
    return this.cryptor.decrypt(data);
  }

  async resolveOutFilePath() {
    try {
      const outputPathStat = await fs.stat(this.outputPath);

      return outputPathStat.isDirectory()
        ? path.resolve(this.outputPath, path.parse(this.inputPath).base)
        : path.resolve(this.outputPath);
    } catch {
      return path.resolve(this.outputPath);
    }
  }

  async writeFile(data: Buffer) {
    const outputPath = await this.resolveOutFilePath();

    await fs.writeFile(outputPath, data);
  }

  async runEncrypt() {
    const inputBuffer = await this.readFile();
    const encryptedBuffer = await this.encrypt(inputBuffer);

    await this.writeFile(encryptedBuffer);
  }

  async runDecrypt() {
    const inputBuffer = await this.readFile();
    const decryptedBuffer = await this.decrypt(inputBuffer);

    await this.writeFile(decryptedBuffer);
  }
}
