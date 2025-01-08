import * as fs from "node:fs/promises";
import * as _path from "node:path";

class LinesOfCode {
  lines: number;

  constructor(readonly extention: string) {
    this.lines = 0;
  }

  add(buffer: string) {
    this.lines++;

    for (const char of buffer) {
      if (char === "\n") this.lines++;
    }
  }
}

class LinesOfCodeMap {
  map: Map<string, LinesOfCode>;

  constructor() {
    this.map = new Map();
  }

  *iter() {
    for (const [, loc] of this.map) {
      yield loc;
    }
  }

  get(extention: string) {
    let linesOfCode = this.map.get(extention);
    if (linesOfCode) return linesOfCode;

    linesOfCode = new LinesOfCode(extention);

    this.map.set(extention, linesOfCode);

    return linesOfCode;
  }

  total() {
    let total = 0;

    for (const { lines } of this.iter()) {
      total += lines;
    }

    return total;
  }

  async add(file: string) {
    const buffer = await fs.readFile(file, { encoding: "utf-8" });
    const extention = LinesOfCodeMap.extentionFrom(file);

    this.get(extention).add(buffer);
  }

  static extentionFrom(file: string) {
    const extention = _path.extname(file);
    if (extention.length === 0) return "unknow";

    return extention;
  }
}

class DirectoryScanner<R = string> {
  private results: Awaited<R>[];

  constructor(readonly callback?: (file: string) => R) {
    this.results = [];
  }

  async scan(dir: string): Promise<Awaited<R>[]> {
    this.results = [];

    await this.scanDir(dir);

    return this.results;
  }

  private async insertFilesInStack(dir: string, path: string): Promise<void> {
    const fullPath = _path.resolve(dir, path);
    const pathStat = await fs.stat(fullPath);

    if (pathStat.isFile()) {
      const result =
        (await this.callback?.(fullPath)) ?? (fullPath as Awaited<R>);

      this.results.push(result);

      return;
    }

    return this.scanDir(fullPath);
  }

  private async scanDir(dir: string) {
    const paths = await fs.readdir(dir);

    const promises = paths.map((path) => this.insertFilesInStack(dir, path));

    await Promise.all(promises);
  }
}

async function main() {
  const linesOfCodeMap = new LinesOfCodeMap();
  const scanner = new DirectoryScanner((file) => linesOfCodeMap.add(file));

  await scanner.scan(process.argv.at(2) ?? ".");

  for (const { extention, lines } of linesOfCodeMap.iter()) {
    console.log(`${extention}: ${lines}`);
  }

  console.log(`total: ${linesOfCodeMap.total()}`);
}

main();
