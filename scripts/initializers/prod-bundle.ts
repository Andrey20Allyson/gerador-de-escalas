import { Command } from 'commander';
import { build } from 'esbuild';
import { ProgramInitializer } from 'index';

export class ProdBundleProgramInitializer implements ProgramInitializer {
  initialize(program: Command): void {
    program
      .command('build:prod')
      .description('build for production')
      .action(async () => {
        await build({
          entryPoints: [
            './src/renderer/index.ts'
          ],
          outdir: './public',
          target: 'es2020',
          bundle: true,
          minify: true,
        });
      });
  }
}