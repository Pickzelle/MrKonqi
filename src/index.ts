import * as loadClient from '#util/load/clients'
import * as loadData from '#util/load/data'

import * as paralload from '#util/paralload'
import parseArgs from '#util/parse/args'
import parseConfig from '#util/parse/config'

import * as logger from '#lib/logger'
const { log } = logger

import type interfaces from '#interfaces'

import packageJson from '#root/package.json'

const args = await parseArgs(packageJson.version)
logger.reconfigure({ verbose: args.verbose, sweetness: args.sweetness })
const { config, processed: extraConf } = await parseConfig(args.config)
logger.reconfigure({ logfile: extraConf.logfile })
log('success', 'parse config')

if (config.path?.paralload) paralload.setParapath(config.path.paralload)

const db = loadClient.prisma()
const storage = loadData.syncedStorage<interfaces.storage>()

const connectDBTask = logger.task('loading to prisma db')
await db.$connect().catch((err) => {
	connectDBTask.fail("couldn't load prisma db")
	log('error', '%', [err])
	process.exit(1)
})
connectDBTask.complete('load prisma db')

loadClient.discord(db, storage, config)

// const CharacterAI = require("node_characterai")
// const characterAI = new CharacterAI()
//
// // Authenticating as a guest (use `.authenticateWithToken()` to use an account)
// await characterAI.authenticateWithToken(
// 	"bc9fd581dbc8ab91ce70563b2282de413cdcc5ab",
// )
//
// // Place your character's id here
// const characterId = "c-jq7OQreWYuZlzWD4b03tPtPJvio3qDwOfi9YnVfng"
//
// // Create a chat object to interact with the conversation
// const chat = await characterAI.createOrContinueChat(characterId)
//
// // Send a message
// const response = await chat.sendAndAwaitResponse(
// 	"javalsai 645238468917731 none\n2024-07-04 01:35:40\nWhat was my previous message and what did I told you?",
// 	true,
// )
//
// console.log(response)
// // Use `response.text` to use it as a string
