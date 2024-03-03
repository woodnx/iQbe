import { defineConfig } from 'tsup';

export default defineConfig({
  target: 'es2020',
  format: ['cjs', 'esm'],
  entry: {
    index: 'src/index.ts', 
    predicates: 'src/predicates.ts',
    types: 'src/generated/@types/index.ts',
    schema: 'src/generated/schema-format.ts',
  },
  clean: true,
  dts: true,
});
