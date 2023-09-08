const path = require('node:path');
const fs = require('node:fs');

const defaultLocale = 'en-US';

const LOCALE_DIR = path.join(__dirname, '../..', 'locales');

/**
 * @class LanguageString
 * @extends {String}
 */
class LanguageString extends String {
	format([...args]) {
		// You either trust this regex works or read this explanation

		// Ik this is weird, basically is (?<=      (?:        ^     |        [^\\]             )    (?:      \\\\)   *     )      \{ (   [0-9]             +                 ) \}
		// So that's                      (look for (a start of line or anythinng that isn't "\") followed by "\\" any times) and "{"   a number   a positive amount of times  "}"
		this.replace(/(?<=(?:^|[^\\])(?:\\\\)*)\{([0-9]+)\}/g, (_match, number) => {
			try {
				const index = parseInt(number);
				return args[index].replace(/\\/g, '\\\\') || '';
			}
			catch {
				// Probably some error parsing the number, shouldn0t happen from that regex but who knows
				return '�';
			}
		})
			// I'm to lazy to explain this, but it basically converts '\{0}' into '{0}', '\' into '' or '\\' into '\'
			.replace(/(?<=(?:^|[^\\])(?:\\\\)*)\\(?=$|[^\\])/g, '').replace(/\\\\/g, '\\');
	}
}

/**
 * @typedef {import('../../locales/model.js')} LocaleModel
 */

/** @type {Object.<string, LocaleModel>} */
const locales = {};

fs.readdirSync(LOCALE_DIR)
	.filter(file => file.endsWith('.json'))
	.forEach(file => {
		locales[file.replace(/\.json$/, '')] =
			require(path.join(LOCALE_DIR, file));
	});

for (const locale in locales) {
	for (const key in locales[locale]) {
		locales[locale][key] = new LanguageString(locales[locale][key]);
	}
}

locales['default'] = locales[defaultLocale];

/**
 * @param {keyof LocaleModel} key
 * @return {Object.<string, LanguageString>}
 */
function mergeLocalesKey(key) {
	const result = {};
	for (const locale in locales) {
		if (locale === 'default' || !locales[locale][key]) continue;
		result[locale] = locales[locale][key]?.toString();
	}
	return result;
}

/**
 * @param {keyof LocaleModel} key
 * @return {String}
 */
function getDefaultLocaleKey(key) {
	return locales.default[key]?.toString();
}

// This is useless but gives autocompletion :P
/**
 * @param {('en-US' | 'sv_SE' | 'es-ES')} locale
 * @return {LocaleModel}
 */
function getLocale(locale) {
	return locales[locale] || locales['en-US'];
}

module.exports = {
	locales,
	extra: {
		LanguageString,
		mergeLocalesKey,
		getDefaultLocaleKey,
		getLocale,
	},
};
