const { green, red, yellowBright } = require('chalk');
const PATH = require('node:path');
let config = null;

try {
	config = require(PATH.join(__dirname, '..', 'config.json'));
}
catch {}

/**
 * Outputs debugging information.
 * @param {String} source - The name of the source file being debugged.
 * @param {Number} debugStatus - The status of the debugging process:
 *
 * 0 = Successful
 * 1 = Failed
 */
function debug(source, debugStatus) {
	const INDENTATION = 25;

	const STATUS = process.env.DEBUG ?? config?.DEBUG ?? null;
	const isDebugEnabled = typeof STATUS === 'string' ? STATUS.toLowerCase() === 'true' : !!STATUS;

	if (!isDebugEnabled) {
		return;
	}

	const STATUS_MESSAGES = {
		0: 'loaded!',
		1: 'failed!',
		2: source,
	};

	const statusMessage = STATUS_MESSAGES[debugStatus] || 'N/A';

	console.log(
		debugStatus === 2 ? yellowBright(source) :
		debugStatus === 0 ? green(`${source}${' '.repeat(Math.max(0, INDENTATION - source.length))} - ${statusMessage}`) :
		debugStatus === 1 ? red(`${source}${' '.repeat(Math.max(0, INDENTATION - source.length))} - ${statusMessage}`) :
		red(`${source}${' '.repeat(Math.max(0, INDENTATION - source.length))} - ${statusMessage}`),
	);
}

module.exports = debug;
