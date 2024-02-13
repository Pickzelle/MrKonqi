// In this file just put the keys to be used and an instance of LanguageString, it helps with JSDoc and autocompletion
// In fact, is not even imported by js at any point, just JSDoc

// Dummy LanguageString to get more autocompletion (importing doesn't work for me for some reason)
/* eslint-disable no-empty-function */
class LanguageString extends String {
	format() { return this; }
}
/* eslint-enable no-empty-function */

module.exports = {
	'architecture:': new LanguageString(''),
	'repository:': new LanguageString(''),
	'description:': new LanguageString(''),
	'upstreamURL:': new LanguageString(''),
	'license:': new LanguageString(''),
	'provides:': new LanguageString(''),
	'replaces:': new LanguageString(''),
	'packageSize:': new LanguageString(''),
	'installedSize:': new LanguageString(''),
	'packager:': new LanguageString(''),
	'submitter:': new LanguageString(''),
	'maintainer:': new LanguageString(''),
	'votes:': new LanguageString(''),
	'popularity:': new LanguageString(''),
	'firstSubmitted:': new LanguageString(''),
	'lastUpdated:': new LanguageString(''),
	'buildDate:': new LanguageString(''),
	'outOfDate:': new LanguageString(''),
	'dependencies': new LanguageString(''),
	'optionalDependencies': new LanguageString(''),
	'makeDependencies': new LanguageString(''),
	'lastSync': new LanguageString(''),
	'max-mem-cant-process': new LanguageString(''),
	'detected-name-confict': new LanguageString(''),
	'cant-find-package-query': new LanguageString(''),
	'cant-find-package-query-in-repo': new LanguageString(''),
	'select-package-to-show': new LanguageString(''),

	'commands-ephemeral-name': new LanguageString(''),
	'commands-ephemeral-description': new LanguageString(''),

	'command-arch-description': new LanguageString(''),
	'command-arch-package-name': new LanguageString(''),
	'command-arch-package-description': new LanguageString(''),
	'command-arch-repository-name': new LanguageString(''),
	'command-arch-repository-description': new LanguageString(''),
	'command-arch-dependencies-name': new LanguageString(''),
	'command-arch-dependencies-description': new LanguageString(''),

	'clear-command-name': new LanguageString(''),
	'clear-command-description': new LanguageString(''),
	'clear-command-ammount-name': new LanguageString(''),
	'clear-command-ammount-description': new LanguageString(''),
	'clear-command-id-description': new LanguageString(''),
	'clear-command-over-300-messages': new LanguageString(''),
	'clear-command-no-more-messages': new LanguageString(''),
	'clear-command-error-race-condition': new LanguageString(''),
	'clear-command-couldnt-delete-from': new LanguageString(''),
	'clear-command-deleted-messages-from': new LanguageString(''),
	'clear-command-couldnt-delete-in-channel': new LanguageString(''),
	'clear-command-deleted-messages': new LanguageString(''),
};
