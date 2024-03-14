import { REST, Routes } from "discord.js";

const registerCommands = async (commands: any[], TOKEN: string, CLIENT_ID: string) => {
	const rest = new REST({ version: "10" }).setToken(TOKEN);

	try {
		console.log("Started refreshing application (/) commands.");
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
};

export default registerCommands;
