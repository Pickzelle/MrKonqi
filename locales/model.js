// In this file just put the keys to be used and an instance of LanguageString, it helps with JSDoc and autocompletion
// In fact, is not even imported by js at any point, just JSDoc

// Dummy LanguageString to get more autocompletion (importing doesn't work for me for some reason)
/* eslint-disable no-empty-function */
class LanguageString extends String {
	format() { return this; }
}
/* eslint-enable no-empty-function */

module.exports = {
	'max-mem-cant-process': new LanguageString(''),
	'detected-name-confict': new LanguageString(''),
	'cant-find-package-query': new LanguageString(''),
	'cant-find-package-query-in-repo': new LanguageString(''),
	'select-package-to-show': new LanguageString(''),
};
