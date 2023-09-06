// In this file just put the keys to be used and an instance of LanguageString, it helps with JSDoc and autocompletion
// In fact, is not even imported by js at any point, just JSDoc

// Dummy LanguageString to get more autocompletion (importing doesn't work for me for some reason)
/* eslint-disable no-empty-function */
class LanguageString extends String {
	format() { }
}
/* eslint-enable no-empty-function */

module.exports = {
	'something': new LanguageString(''),
};
