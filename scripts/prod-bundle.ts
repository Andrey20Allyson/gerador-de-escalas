import { build } from 'esbuild';

async function main() {
  build({
    entryPoints: [
      './src/renderer/index.ts'
    ],
    outdir: './public',
    target: 'es2020',
    bundle: true,
    minify: true,
  });
}

main();