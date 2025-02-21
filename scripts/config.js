const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const replace = require('@rollup/plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

const formatNameMap = {
  'vee-validate': 'VeeValidate',
  rules: 'VeeValidateRules',
  i18n: 'VeeValidateI18n',
  zod: 'VeeValidateZod',
  yup: 'VeeValidateYup',
};

const pkgNameMap = {
  'vee-validate': 'vee-validate',
  rules: 'vee-validate-rules',
  i18n: 'vee-validate-i18n',
  zod: 'vee-validate-zod',
  yup: 'vee-validate-yup',
};

const formatMap = {
  es: 'esm',
  umd: '',
};

function createConfig(pkg, format) {
  const tsPlugin = typescript({
    tsconfig: path.resolve(__dirname, '../tsconfig.json'),
    cacheRoot: path.resolve(__dirname, '../node_modules/.rts2_cache'),
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      exclude: ['**/tests'],
    },
  });

  const version = require(path.resolve(__dirname, `../packages/${pkg}/package.json`)).version;
  const isEsm = format === 'es';

  const config = {
    input: {
      input: path.resolve(__dirname, `../packages/${pkg}/src/index.ts`),
      external: ['vue', isEsm ? '@vue/devtools-api' : undefined, 'zod'].filter(Boolean),
      plugins: [
        replace({
          preventAssignment: true,
          values: {
            __VERSION__: version,
            __DEV__: isEsm ? `(process.env.NODE_ENV !== 'production')` : 'false',
          },
        }),
        tsPlugin,
        resolve({
          dedupe: ['klona', 'klona/full'],
        }),
        commonjs(),
      ],
    },
    output: {
      banner: `/**
  * vee-validate v${version}
  * (c) ${new Date().getFullYear()} Abdelrahman Awad
  * @license MIT
  */`,
      format,
      name: format === 'umd' ? formatNameMap[pkg] : undefined,
      globals: {
        vue: 'Vue',
      },
    },
  };

  config.bundleName = `${pkgNameMap[pkg]}${formatMap[format] ? '.' + formatMap[format] : ''}.js`;

  // if (options.env) {
  //   config.input.plugins.unshift(
  //     replace({
  //       'process.env.NODE_ENV': JSON.stringify(options.env)
  //     })
  //   );
  // }

  return config;
}

module.exports = {
  formatNameMap,
  pkgNameMap,
  formatMap,
  createConfig,
};
