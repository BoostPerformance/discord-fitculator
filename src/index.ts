import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import commands from "./commands";
import { CLIENT_ID, TOKEN } from "../config/env";
import sendRankGraph from "../crons/weekly/sendRankGraph";
import registerCommands from "./slash";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

registerCommands(commands, TOKEN, CLIENT_ID);

client.on("ready", async () => {
	sendRankGraph();
	console.log(`Logged in as ${client.user?.tag}!`);
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
	console.log(reaction, user);
});

client.on("interactionCreate", async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.find((command) => command.name === interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.log(error);

		await interaction.reply({
			content: "명령을 실행하는 중에 문제가 생겼어요!",
			ephemeral: true,
		});
	}
});

client.login(TOKEN);
