const fs = require('fs');
const common = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/common.js';
const tdcore = 'node_modules/@tezos-domains/core/dist/core.es2015.js';
const uts46 = 'node_modules/idna-uts46-hx/uts46.js';

const fallback = `
fallback: {
  path: require.resolve('path-browserify'),
  process: require.resolve('process/browser'),
  fs: require.resolve('fs'),
  assert: require.resolve('assert'),
  crypto: require.resolve('crypto-browserify'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  buffer: require.resolve('buffer'),
  stream: require.resolve('stream-browserify')
},
alias: {
  assert: "assert",
  buffer: "buffer",
  crypto: "crypto-browserify",
  http: "stream-http",
  https: "https-browserify",
  os: "os-browserify/browser",
  path: "path-browserify",
  process: "process/browser",
  stream: "stream-browserify"
},
`;

const plugins = `
new webpack_2.ProvidePlugin({
  process: 'process/browser',
  Buffer: ['buffer', 'Buffer']
}),
new webpack_2.EnvironmentPlugin({'NODE_DEBUG': false}),
`;

let data = fs.readFileSync(tdcore, 'utf8');
data = data.replace("import { randomInt } from 'crypto';", "import { randomInt } from 'crypto-js';");
fs.writeFileSync(tdcore, data, 'utf8');

data = fs.readFileSync(common, 'utf8');
if (data.indexOf('fallback: {') === -1) {
  data = data.replace(
    '(scriptTarget, isPlatformServer),',
    `(scriptTarget, isPlatformServer),
      ${fallback}
    `
  );
  data = data.replace(
    'plugins_1.DedupeModuleResolvePlugin({ verbose }),',
    `plugins_1.DedupeModuleResolvePlugin({ verbose }),
      ${plugins}
    `
  );
  fs.writeFileSync(common, data, 'utf8');
}

data = fs.readFileSync(uts46, 'utf8');
data = data.replace(/punycode\.ucs2\.decode/g, 'punycode.ucs2decode');
data = data.replace(/punycode\.ucs2\.encode/g, 'punycode.ucs2encode');
fs.writeFileSync(uts46, data, 'utf8');

data = fs.readFileSync(common, 'utf8');
if (data.indexOf('fallback: {') === -1) {
  data = data.replace(
    '(scriptTarget, isPlatformServer),',
    `(scriptTarget, isPlatformServer),
      ${fallback}
    `
  );
  data = data.replace(
    'plugins_1.DedupeModuleResolvePlugin({ verbose }),',
    `plugins_1.DedupeModuleResolvePlugin({ verbose }),
      ${plugins}
    `
  );
  data = data.replace('cache: (0, helpers_1.getCacheSettings)(wco, NG_VERSION.full)', 'cache: false');
  fs.writeFileSync(common, data, 'utf8');
}
