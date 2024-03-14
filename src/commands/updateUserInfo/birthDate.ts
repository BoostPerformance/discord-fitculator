import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";
import { getCurrentDateUTC, parseDateFromString } from "../../utils/dateUtils";
import { buildReplyMessage } from "../../utils/fitnessUtils";

const insertBirth = {
	...new SlashCommandBuilder()
		.setName("정보수정-생년월일")
		.setDescription("생년월일 8자리를 입력해주세요.(ex:19991215)")
		.addStringOption((option) =>
			option
				.setName("생년월일")
				.setDescription("생년월일 8자리를 입력해주세요 (ex:19991215)")
				.setRequired(true)
				.setMinLength(8)
				.setMaxLength(8)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const birthInput = interaction.options.getString("생년월일", true);
			const { id: discordId, globalName, username } = interaction.user;

			await interaction.deferReply();

			const birthDate = parseDateFromString(birthInput);
			if (!birthDate) {
				return await interaction.editReply("올바르지 않은 생년월일 형식입니다.");
			}

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
					birth: birthDate,
					updatedAt: currentDate,
					createdAt: currentDate,
				},
				update: {
					birth: birthDate,
					updatedAt: currentDate,
				},
			});

			const replyMessage = buildReplyMessage(user);
			const dmChannel = await interaction.user.createDM();
			await dmChannel.send(`생년월일 정보가 변경되었습니다!\n${replyMessage}`);
			await interaction.editReply(`생년월일 정보가 변경되었습니다!`);
		} catch (error) {
			await interaction.editReply("데이터베이스 오류가 발생했습니다. 나중에 다시 시도해주세요.");
		}
	},
};

export default insertBirth;
