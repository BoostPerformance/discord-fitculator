import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import path from "path";
import { createDonutChartBuffer } from "../../utils/Chart/weeklyPointDonut";
import { getCardioWorkoutScores, getIntervalWorkoutCount } from "../../utils/dataUtils";

const MAX_SCORE = 100;

const weeklyCardioWorkoutPoints = {
	...new SlashCommandBuilder()
		.setName("운동그래프보기-이번주")
		.setDescription("나의 이번주 운동포인트를 확인할 수 있습니다."),
	async execute(interaction: ChatInputCommandInteraction) {
		const { id: discordId } = interaction.user;
		await interaction.deferReply();
		const logoPath = path.join(__dirname, "../public/logo.png");
		const { scoresByWorkout, totalScore } = await getCardioWorkoutScores(discordId);
		const intervalWorkoutCount = await getIntervalWorkoutCount(discordId);
		const imageBuffer = await createDonutChartBuffer(
			scoresByWorkout,
			totalScore,
			MAX_SCORE,
			intervalWorkoutCount,
			logoPath
		);

		if (!imageBuffer) {
			return await interaction.editReply({
				content: "이번주에는 아직 유산소 운동을 하지 않았어요!",
			});
		}

		await interaction.editReply({
			files: [new AttachmentBuilder(imageBuffer)],
			content: `📊 이번주 운동 현황입니다!`,
		});
	},
};

export default weeklyCardioWorkoutPoints;
