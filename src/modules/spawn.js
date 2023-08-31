const { spawn } = require('child_process');

/**
 * Runs a series of processes sequentially using Node.js `spawn`.
 * This function first spawns a download process, and if successful,
 * it spawns a conversion process. The console output of the processes
 * is shared with the parent process.
 *
 * @async
 * @returns {Promise<string>} A promise that resolves with a success message if all processes complete successfully.
 * @throws {Error} If there's an error during process spawning or if any of the processes fail.
 */
async function runProcesses() {
	return new Promise((resolve, reject) => {
		try {
			// Spawn the packages module
			const downloadProcess = spawn('node', ['./modules/packages.js'], {
				stdio: 'inherit',
			});

			downloadProcess.on('close', async (downloadExitCode) => {
				if (downloadExitCode === 0) {
					// Spawn the second process if the first one succeeded
					const convertProcess = spawn('node', ['./modules/convert.js'], {
						stdio: 'inherit',
					});

					convertProcess.on('close', (convertExitCode) => {
						if (convertExitCode === 0) {
							resolve('Conversion process completed successfully.');
						}
						else {
							reject('Conversion process failed.');
						}
					});
				}
				else {
					reject('Download process failed.');
				}
			});

			downloadProcess.on('error', (error) => {
				reject(new Error('Error spawning download process: ' + error));
			});
		}
		catch (error) {
			reject(error);
		}
	});
}

module.exports = runProcesses;

