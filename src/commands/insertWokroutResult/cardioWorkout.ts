// cardioWorkoutResult.ts
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { WorkoutName } from "@prisma/client";
import { CARDIO_WORKOUT_CHOICES, ERROR_MESSAGES } from "../../../config/constants";
import { processCardioWorkout } from "../../services/cardioWorkoutService";

const insertCardioWorkoutResult = new SlashCommandBuilder()
	.setName("운동업로드-유산소")
	.setDescription("유산소 운동시간과 심박수가 기록된 사진을 전송합니다.")
	.addStringOption((option) =>
		option
			.setName("운동-이름")
			.setDescription("운동 이름을 선택해주세요.")
			.setRequired(true)
			.addChoices(...CARDIO_WORKOUT_CHOICES)
	)
	.addAttachmentOption((option) =>
		option
			.setName("운동-결과")
			.setDescription("운동 결과가 기록된 사진을 선택해주세요.(운동시간, 심박수)")
			.setRequired(true)
	);

async function execute(interaction: ChatInputCommandInteraction) {
	try {
		await interaction.deferReply();

		const attachment = interaction.options.getAttachment("운동-결과", true);
		const workoutName = interaction.options.getString("운동-이름", true) as WorkoutName;
		const discordId = interaction.user.id;

		const reply = await processCardioWorkout(attachment, workoutName, discordId);
		await interaction.editReply(reply);
	} catch (error) {
		console.error(error);
		await interaction.editReply(ERROR_MESSAGES.UNEXPECTED_ERROR);
	}
}

export default { ...insertCardioWorkoutResult, execute };
