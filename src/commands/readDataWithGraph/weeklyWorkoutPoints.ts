import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createChartBuffer } from "../../utils/Chart/weeklyPoint";
import { getAllWorkoutData } from "../../utils/dataUtils";

const weeklyWorkoutPoints = {
	...new SlashCommandBuilder()
		.setName("커뮤니티그래프보기")
		.setDescription("이번주 참가자 전체 운동포인트를 확인할 수 있습니다."),
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const data = await getAllWorkoutData("4");
		const imageBuffer = await createChartBuffer(data);

		if (!imageBuffer) {
			return await interaction.editReply({
				content: "주간 운동 그래프를 가져오는데 문제가 생겼어요! 관리자에게 문의해주세요.",
			});
		}

		await interaction.editReply({
			files: [new AttachmentBuilder(imageBuffer)],
			content: `📊 4기 전체 이번주 운동포인트 입니다.`,
		});
	},
};

export default weeklyWorkoutPoints;
