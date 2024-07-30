import { program } from 'commander';
import { OptionInfoBuilder, loadCommand } from './lib';
import { generate, generateOptionsSchema } from './actions/generate';
import { bench, benchOptionsSchema } from './actions/bench/bench';
import { upload, uploadWorkersOptionsSchema } from './actions/upload-workers';
import { transformWorkers, transformWorkersOptionsSchema } from './actions/transform-workers';

loadCommand({
  schema: generateOptionsSchema,
  command: 'generate',
  aliases: ['gen', 'g'],
  description: `Generates a extra schedule`,
  optionInfos: {
    date: OptionInfoBuilder
      .alias('d')
      .describe('the month of extra duty table'),
    input: OptionInfoBuilder
      .alias('i')
      .describe('the input file path'),
    output: OptionInfoBuilder
      .alias('o')
      .describe('the output file path'),
    tries: OptionInfoBuilder
      .alias('t')
      .describe('the number of times that the program will try generate the table'),
    mode: OptionInfoBuilder
      .alias('m')
      .describe('select the execution mode'),
  },
  action: generate,
});

loadCommand({
  schema: benchOptionsSchema,
  command: 'bench',
  aliases: ['bnc', 'b', 'mark'],
  description: `Benchmarks the table generation`,
  optionInfos: {
    times: OptionInfoBuilder
      .alias('t')
      .describe('How much times the program with run the assign procedure'),
    weight: OptionInfoBuilder
      .alias('w')
      .describe('How much hard is to assign a worker')
      .hint('low|mid|high'),
  },
  action: bench,
});

loadCommand({
  schema: uploadWorkersOptionsSchema,
  command: 'upload:workers',
  aliases: ['upw'],
  description: 'Uploads one or more WorkerRegistry',
  optionInfos: {
    input: OptionInfoBuilder
      .alias('i')
      .describe('Input file, a .json that implements a Array<WorkerRegistryInit>'),
  },
  action: upload,
});

loadCommand({
  schema: transformWorkersOptionsSchema,
  command: 'transform:workers',
  aliases: ['tfw'],
  description: 'Runs a script that update persisted workers',
  optionInfos: {
    source: OptionInfoBuilder
      .alias('s')
      .describe('Input source file, a .js exports by default a Transformer'),
  },
  action: transformWorkers,
})

program.parse();