const AXIOS = require('axios')

/**
 * Calls the Arch User Repository (AUR) API to retrieve information about a package.
 *
 * @param {string} package - The name of the package to retrieve information for.
 * @returns {Promise<AxiosResponse>} The Axios response containing package information.
 */
function callAUR(packagee) {
	return AXIOS.get(`https://aur.archlinux.org/rpc/v5/info/${packagee}`, {
		method: 'GET',
		headers: {
			accept: 'application/json',
		},
	})
}

module.exports = callAUR
