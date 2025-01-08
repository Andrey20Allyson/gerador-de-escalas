import { Command } from "commander";
import { context } from "esbuild";
import { ProgramInitializer } from "index";
import path from "node:path";
import ts from "typescript";
import { externalsPlugin } from "../utils/esbuild-plugin";

const tsconfig = path.join(process.cwd(), "tsconfig.json");

async function runDevBundle() {
  const ctx = await context({
    bundle: true,
    sourcemap: "inline",
    entryPoints: ["./src/renderer/index.ts"],
    target: "es2020",
    outdir: "./public",
    tsconfig,
  });

  await ctx.watch();
}

async function runDevBuildOfApploader() {
  const ctx = await context({
    bundle: true,
    // sourcemap: "inline",
    entryPoints: ["./src/apploader/index.ts", "./src/apploader/preload.ts"],
    platform: "node",
    format: "cjs",
    outdir: "dist/",
    tsconfig,
    plugins: [externalsPlugin()],
  });

  await ctx.watch();
}

export class DevBuildProgramInitializer implements ProgramInitializer {
  initialize(program: Command): void {
    program
      .command("build:dev")
      .description("build for development")
      .action(async () => {
        await runDevBundle();

        await runDevBuildOfApploader();
      });
  }
}
