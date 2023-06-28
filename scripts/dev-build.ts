import { context } from 'esbuild';
import ts from 'typescript';

async function runDevBundle() {
  const ctx = await context({
    bundle: true,
    entryPoints: [
      './src/renderer/index.ts',
    ],
    target: 'es2020',
    sourcemap: true,
    outdir: './public'
  });

  await ctx.watch();
}

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};

function runDevBuild(onBuild?: () => void) {
  const configPath = ts.findConfigFile('./src/app', ts.sys.fileExists, 'tsconfig.json');

  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;

  const host = ts.createWatchCompilerHost(
    configPath,
    {},
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged,
  );

  const origPostProgramCreate = host.afterProgramCreate;

  host.afterProgramCreate = program => {
    onBuild?.();
    origPostProgramCreate!(program);
  };

  return ts.createWatchProgram(host);
}

function reportDiagnostic(diagnostic: ts.Diagnostic) {
  console.error("Error", diagnostic.code, ":", ts.flattenDiagnosticMessageText(diagnostic.messageText, formatHost.getNewLine()));
}

function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.info(ts.formatDiagnostic(diagnostic, formatHost));
}

async function main() {
  await runDevBundle();

  runDevBuild();
}

main();