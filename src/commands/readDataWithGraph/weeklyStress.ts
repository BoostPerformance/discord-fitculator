import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createWeeklyStressChartBuffer } from "../../utils/Chart/weeklyStress";
import { calculateWeeklyLoadsForUser } from "../../utils/dataUtils";

const weklyStress = {
	...new SlashCommandBuilder()
		.setName("운동그래프보기-이번달")
		.setDescription("나의 주별 운동량을 확인할 수 있습니다."),
	async execute(interaction: ChatInputCommandInteraction) {
		const discordId = interaction.user.id;

		try {
			await interaction.deferReply();
			const result = await calculateWeeklyLoadsForUser(discordId);
			//@ts-ignore
			const imageBuffer = await createWeeklyStressChartBuffer(result);

			await interaction.editReply({
				files: [new AttachmentBuilder(imageBuffer)],
				content: "📊 파란색은 운동량, 빨간색은 피로도 입니다!",
			});
		} catch (error) {
			await interaction.editReply("그래프를 가져오는데 문제가 생겼어요! 관리자에게 문의해주세요");
		}
	},
};

export default weklyStress;
