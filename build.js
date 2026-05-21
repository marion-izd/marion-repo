import StyleDictionary from 'style-dictionary';
import { register, permutateThemes } from '@tokens-studio/sd-transforms';
import { readFileSync } from 'node:fs';

register(StyleDictionary);

StyleDictionary.registerTransform({
  name: 'name/figma-code-syntax',
  type: 'name',
  transform: (token) => {
    const web = token.$extensions?.['com.figma.codeSyntax']?.Web;
    if (web) return web.replace(/^--/, '');
    return token.path.join('-').toLowerCase().replace(/\s+/g, '-');
  },
});

const TOKENS_DIR = './token';

const $themes = JSON.parse(readFileSync(`${TOKENS_DIR}/$themes.json`, 'utf8'));
const themes = permutateThemes($themes);

console.log('Detected themes:', Object.keys(themes));

for (const [themeName, sets] of Object.entries(themes)) {
  const sources = sets.map((set) => `${TOKENS_DIR}/${set}.json`);
  console.log(`\n--- Building theme: ${themeName} ---`);

  const sd = new StyleDictionary({
    source: sources,
    preprocessors: ['tokens-studio'],
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/figma-code-syntax'],
        buildPath: 'build/',
        files: [
          {
            destination: `${themeName}.css`,
            format: 'css/variables',
            options: { outputReferences: true },
          },
        ],
      },
    },
  });

  await sd.cleanAllPlatforms();
  await sd.buildAllPlatforms();
}
