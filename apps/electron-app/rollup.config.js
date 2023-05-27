import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: {
          dir: 'build',
          format: 'cjs'
        },
        plugins: [typescript()]
      },
      {
        input: 'src/preload/preload.ts',
        output: {
          dir: 'build/preload',
          format: 'cjs',
        
        },
        plugins: [typescript({
            compilerOptions: {
                baseUrl: 'src/preload',
                outDir: 'build/preload'
            }
        })]
      }
];