import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    labeling: 'src/labeling.ts',
    session: 'src/session.ts',
    corpus: 'src/corpus.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
});
