import fs from "fs";
import path from "path";
import YAML from 'yaml';
import { AutoScheduleConfig, parseConfig } from "./schema";

const CONFIG_PATH = path.resolve(
  process.cwd(),
  `auto-schedule.config.yml`,
);

const configBuffer = readConfigFile(CONFIG_PATH);
export const autoScheduleConfig = parseConfig(YAML.parse(configBuffer));

type RecursivePartial<T> = { [K in keyof T]?: T[K] extends object ? RecursivePartial<T[K]> : T[K] };

function recursiveAssign<T>(partialValue: RecursivePartial<T> | undefined | null, defaultValue: T): T {
  if (partialValue === undefined || partialValue === null) return defaultValue;
  if (typeof defaultValue !== 'object') {
    return (partialValue ?? defaultValue) as T;
  }

  const object = {} as T;

  for (const key in defaultValue) {
    object[key] = recursiveAssign<T[Extract<keyof T, string>]>(partialValue[key], defaultValue[key]);
  }

  return object;
}

function readConfigFile(path: string): string {
  try {
    const buffer = fs.readFileSync(path, { encoding: 'utf-8' })

    return buffer;
  } catch {
    return '{}';
  }
}

export function createAutoScheduleConfig(factory: (config: AutoScheduleConfig) => RecursivePartial<AutoScheduleConfig>): AutoScheduleConfig {
  const defaultConfig = parseConfig({});

  const partialConfig = factory(defaultConfig);

  return recursiveAssign(partialConfig, defaultConfig);
}