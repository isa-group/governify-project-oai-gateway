/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

const fs = require('fs');
const { promisify } = require('util');
const readdirAsync = promisify(fs.readdir);
const writeFileAsync = promisify(fs.writeFile);
const request = require('superagent');
const enDictionary = require('../lib/i18n/en').default;

const isSupportedByAuth0 = lang => ['en', 'es', 'pt-br', 'it', 'de'].includes(lang);
const escapeWildCards = str => str.replace(/\%d/gi, '__d__').replace(/\%s/gi, '__s__');
const restoreWildCards = str =>
  str.replace(/__( d|d |d)__/gi, '%d').replace(/__( s|s |s)__/gi, '%s');

const processLanguage = async lang => {
  console.log(`translating: ${lang}`);
  const langDictionary = require('../lib/i18n/' + lang).default;
  await processNode(enDictionary, langDictionary, lang);
  const communityAlert = `
  // This file was automatically translated.
  // Feel free to submit a PR if you find a more accurate translation.
`;
  const jsContent = `
  ${isSupportedByAuth0(lang) ? '' : communityAlert}
  export default ${JSON.stringify(langDictionary, null, 2)};
`;
  await writeFileAsync(`src/i18n/${lang}.js`, jsContent);
};

const processNode = async (enNode, langNode, lang) => {
  for (enKey of Object.keys(enNode)) {
    if (typeof enNode[enKey] === 'object') {
      await processNode(enNode[enKey], langNode[enKey], lang);
    } else {
      if (!langNode[enKey]) {
        const translation = await translateKey(enNode[enKey], lang);
        langNode[enKey] = translation;
      }
    }
  }
};

const translateKey = async (toTranslate, lang) => {
  const result = await request
    .get('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&dt=t')
    .set('Content-Type', 'application/json')
    .query({ tl: lang })
    .query({ q: escapeWildCards(toTranslate) });
  return restoreWildCards(result.body[0][0][0]);
};

const run = async () => {
  const files = await readdirAsync('lib/i18n/');
  for (file of files) {
    const language = file.split('.')[0];
    if (language !== 'en') {
      await processLanguage(language);
    }
  }
};

run();
