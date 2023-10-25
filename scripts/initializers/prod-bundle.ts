import { Command } from 'commander';
import { build } from 'esbuild';
import { ProgramInitializer } from 'index';
import cp from 'child_process';

type ExecResult = {
  stdout: string;
  stderr: string;
};

function exec(command: string) {
  return new Promise<ExecResult>((resolve, reject) => {
    cp.exec(command, (err, stdout, stderr) => {
      if (err !== null) reject(err);

      resolve({
        stderr,
        stdout,
      });
    });
  });
}

export class ProdBuildProgramInitializer implements ProgramInitializer {
  initialize(program: Command): void {
    program
      .command('build:prod')
      .description('build for production')
      .action(async () => {
        await Promise.all([
          build({
            entryPoints: [
              './src/renderer/index.ts'
            ],
            outdir: './public',
            target: 'es2020',
            bundle: true,
            minify: true,
          }),
          exec('npx tsc -p src/app'),
        ]);

        console.log('Builded with success');
      });
  }
}