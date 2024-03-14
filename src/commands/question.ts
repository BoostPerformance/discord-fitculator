import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { prisma } from "../db";
import questionAndAnswer from "../utils/question";

const question = {
	...new SlashCommandBuilder()
		.setName("질문")
		.setDescription("피트메이트에게 운동질문을 합니다.")
		.addStringOption((option) =>
			option.setName("질문내용").setDescription("운동 종류를 선택해주세요.").setRequired(true)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const question = interaction.options.getString("질문내용", true);
			const { id: discordId, globalName, username } = interaction.user;

			await interaction.deferReply();

			const userExists = await prisma.user.findFirst({
				where: { discord_id: discordId },
			});

			if (!userExists) {
				return await interaction.editReply("기본정보 등록을 먼저 해주세요!");
			}

			const answer = await questionAndAnswer(question, userExists);

			await interaction.editReply(`질문:\n \`${question}\`\n\n${answer}`);
		} catch (error) {
			console.log(error);
			await interaction.editReply("데이터베이스 오류가 발생했습니다. 나중에 다시 시도해주세요.");
		}
	},
};

export default question;
