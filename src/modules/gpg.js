const axios = require('axios').default;
const gpg = require('openpgp');

/**
 * @typedef {Object} QueryResult
 * @property {string} keyid - key id (<algorithm>/<id>)
 * @property {Date} date - key generation date
 * @property {string} dwUrl - download key url
 * @property {Array.<[string, Date]>} uids - array of uid string and date
 */

function genLookupUrl(prot, host, query) {
	return `${prot}://${host}/pks/lookup?search=${query}&fingerprint=on&op=index`;
}

function listResuts(url, prot, host, fn) {
	return new Promise((resolve, reject) => {
		axios.get(url, { timeout: 2000 }).then(response => {
			const results = parseResults(response.data, prot, host);
			for (const result of results) fn(result);
			resolve();
		}).catch((err) => {
			// Just ignore if timed out
			if (err.code === 'ECONNABORTED') return resolve();
			if (err.response?.status === 404) return reject('Couldn\'t find any result for the query');
			reject(String(err));
		});
	});

}

// Please don't kill me, web scraping is hard
function parseResults(htmlData = '', prot, host) {
	let results =
		htmlData.slice(htmlData.indexOf('<hr />'), htmlData.indexOf('</body>'))
			.split('<hr />').slice(1);

	if (results.length > 25) throw 'Too many entries, try a more specific query.';

	results = results.map(result => {
		let keyid, date, dwUrl;
		const uids = [];
		result = result.slice(5, -7).split('\n').filter(value => value);
		result.forEach((line, i) => {
			if (line.startsWith('<strong>pub')) {
				const linkStart = line.indexOf('a');

				keyid = line.slice(linkStart, line.indexOf('<', linkStart)).split('').reverse();
				keyid = keyid.slice(0, keyid.indexOf('>')).reverse().join('');
				keyid = keyid.split('/');
				keyid[1] = keyid[1].toUpperCase();
				keyid = keyid.join('/');

				dwUrl = line.slice(line.indexOf('"') + 1);
				dwUrl = dwUrl.slice(0, dwUrl.indexOf('"'));
				dwUrl = dwUrl.startsWith('/') ? prot + '://' + host + dwUrl : dwUrl;

				date = line.split('').reverse();
				date = date.slice(0, date.indexOf(' ')).reverse().join('');
				date = new Date(date);
			}
			else if (line.startsWith('<strong>uid')) {
				let id, uidDate;

				const idStart = line.indexOf('uid">') + 5;
				id = line.slice(idStart, line.indexOf('<', idStart));
				id = id.replace('&lt;', '<').replace('&gt;', '>');

				const dateLine = result[i + 1];
				const dateStart = dateLine.indexOf('/a> ') + 4;
				uidDate = dateLine.slice(dateStart, dateLine.indexOf(' ', dateStart));
				uidDate = new Date(uidDate);

				uids.push([id, uidDate]);
			}
		});
		return { keyid, date, dwUrl, uids };
	});

	return results;
}


/**
 * @param {import('discord.js').Client} BOT - The Discord bot client
 * @param {import('sqlite3').Database} DB - SQLite3 database
 */
function init(BOT, DB) {
	return {
		/**
		 * @param {string} query
		 * @return {Promise<Array.<QueryResult>>}
		 */
		async searchKeyservers(query) {
			const prot = 'http';
			const keyservers = ['185.125.188.26'];
			const results = [];
			const promises = keyservers.map(keyserver =>
				listResuts(
					genLookupUrl(prot, keyserver, query),
					prot, keyserver, item => results.push(item),
				),
			);
			await Promise.all(promises);
			return results;
		},
		/**
		 * @param {string} url
		 * @param {import('discord.js').User} user
		 */
		async importKeyToUser(keyData, keyID, user) {
			console.log('We imported ' + keyID + ' to ' + user.displayName);
			return { keyData, keyID, user };
			// TODO: Save key into user ID (user.id), throw string with message if any error
		},
	};
}

module.exports = init;
