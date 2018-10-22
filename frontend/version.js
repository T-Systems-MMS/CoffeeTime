const { gitDescribeSync } = require('git-describe');
const { version } = require('./package.json');
const { resolve, relative } = require('path');
const { writeFileSync } = require('fs-extra');

const versionInfo = {};
try {
    versionInfo.hash = gitDescribeSync({
        dirtyMark: false,
        dirtySemver: false
    }).hash;
} catch(e) {
    // we are on heroku...
    versionInfo.hash = process.env['SOURCE_VERSION'].slice(0, 7);
}

versionInfo.version = version;

const file = resolve(__dirname, 'src', 'environments', 'version.ts');
writeFileSync(file,
`// IMPORTANT: THIS FILE IS AUTO GENERATED! DO NOT MANUALLY EDIT OR CHECKIN!
/* tslint:disable */
export const VERSION = ${JSON.stringify(versionInfo, null, 4)};
/* tslint:enable */
`, { encoding: 'utf-8' });

console.log(`Wrote version info ${versionInfo.hash} to ${relative(__dirname, file)}`);