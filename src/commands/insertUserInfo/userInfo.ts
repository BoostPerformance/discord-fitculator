import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { prisma } from "../../db";
import { parseDateFromString } from "../../utils/dateUtils";
import { buildReplyMessage } from "../../utils/fitnessUtils";

const insertUserInfo = {
	...new SlashCommandBuilder()
		.setName("기본정보등록")
		.setDescription("분석에 필요한 기본정보를 입력합니다. (이름/기수/생년월일/RHR)")
		.addStringOption((option) =>
			option
				.setName("이름")
				.setDescription("이름을 입력해주세요.(ex: 류현지)")
				.setRequired(true)
				.setMinLength(2)
		)
		.addStringOption((option) =>
			option
				.setName("기수")
				.setDescription("등록하신 기수를 선택해주세요.")
				.setRequired(true)
				.addChoices({ name: "4기", value: "4" })
		)
		.addStringOption((option) =>
			option
				.setName("생년월일")
				.setDescription("생년월일 8자리를 입력해주세요 (ex:19991215)")
				.setRequired(true)
				.setMinLength(8)
				.setMaxLength(8)
		)
		.addIntegerOption((option) =>
			option
				.setName("안정시-심박수")
				.setDescription("안정시 심박수를 입력해주세요.(ex: 45)")
				.setRequired(true)
				.setMinValue(30)
				.setMaxValue(140)
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const discordId = interaction.user.id;
		const name = interaction.options.getString("이름", true);
		const grade = interaction.options.getString("기수", true);
		const birthDate = interaction.options.getString("생년월일", true);
		const restingHeartRate = interaction.options.getInteger("안정시-심박수", true);

		try {
			await interaction.deferReply();

			const userExists = await prisma.user.findFirst({
				where: {
					name: name,
					year: {
						some: {
							year: {
								grade: grade,
							},
						},
					},
				},
			});

			if (!userExists) {
				await interaction.editReply("등록되지 않은 유저입니다. 관리자에게 문의하세요.");
				return;
			}

			if (userExists.restingHeartRate && userExists.birth) {
				await interaction.editReply(
					"이미 등록이 진행된 유저입니다. 명령어를 통해 정보를 수정하거나, 관리자에게 문의하세요."
				);
				return;
			}

			const birth = parseDateFromString(birthDate);
			const user = await prisma.user.update({
				where: { id: userExists.id },
				data: { birth: birth, restingHeartRate: restingHeartRate, discord_id: discordId },
			});

			const replyMessage = buildReplyMessage(user);
			const dmChannel = await interaction.user.createDM();
			await dmChannel.send(`나의 기본 정보 입니다.\n${replyMessage}`);
			await interaction.editReply(`기본 정보가 등록되었습니다!`);
		} catch (error) {
			await interaction.editReply("정보를 불러오는 중 문제가 발생했습니다. 관리자에게 문의하세요.");
		}
	},
};

export default insertUserInfo;
