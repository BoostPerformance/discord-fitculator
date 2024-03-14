import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";
import { getCurrentDateUTC } from "../../utils/dateUtils";
import { buildReplyMessage } from "../../utils/fitnessUtils";

const insertRestingRate = {
	...new SlashCommandBuilder()
		.setName("정보수정-안정시심박수")
		.setDescription("안정시 심박수를 입력해주세요.(ex: 45)")
		.addIntegerOption((option) =>
			option
				.setName("rate")
				.setDescription("안정시 심박수를 입력해주세요.(ex: 45)")
				.setRequired(true)
				.setMinValue(30)
				.setMaxValue(140)
		),

	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const restingHeartRate = interaction.options.getInteger("rate", true);
			const { id: discordId, globalName, username } = interaction.user;

			await interaction.deferReply();

			const currentDate = getCurrentDateUTC();

			const userExists = await prisma.user.findFirst({
				where: { discord_id: discordId },
			});

			if (!userExists) {
				return await interaction.editReply("기본정보 등록을 먼저 해주세요!");
			}

			const user = await prisma.user.upsert({
				where: { discord_id: discordId },
				create: {
					discord_id: discordId,
					nickname: globalName || username,
					restingHeartRate: restingHeartRate,
					createdAt: currentDate,
					updatedAt: currentDate,
				},
				update: {
					restingHeartRate: restingHeartRate,
					updatedAt: currentDate,
				},
			});

			const replyMessage = buildReplyMessage(user);
			const dmChannel = await interaction.user.createDM();
			await dmChannel.send(`안정시 심박수가 변경되었습니다!\n${replyMessage}`);
			await interaction.editReply(`안정시 심박수가 변경되었습니다!`);
		} catch (error) {
			await interaction.editReply("데이터베이스 오류가 발생했습니다. 나중에 다시 시도해주세요.");
		}
	},
};

export default insertRestingRate;
