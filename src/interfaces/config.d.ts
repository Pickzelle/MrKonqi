export interface config {
	$schema?: string

	discord: {
		token: string
		id: {
			bot: string
			guild: string
		}
	}

	characterAI: {
		MrKonqi: string
	}

	path?: {
		paralload?: string
	}

	dirs: {
		log: string
	}
}
