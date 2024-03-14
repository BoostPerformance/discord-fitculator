// cardioWorkoutService.ts
import { AttachmentBuilder } from "discord.js";
import path from "path";
import { prisma } from "../db";
import { createDonutChartBuffer } from "../utils/Chart/weeklyPointDonut";
import { getCardioWorkoutScores, getIntervalWorkoutCount } from "../utils/dataUtils";
import { getCurrentDateWithTimezoneOffset } from "../utils/dateUtils";
import {
	calculateAge,
	calculateHRM,
	calculatePoint,
	calculatePointDailyRating,
	determineExerciseIntensityZone,
	getExerciseIntensityZone,
} from "../utils/fitnessUtils";
import { roundToDecimal } from "../utils/mathUtils";
import { downloadImageAsBuffer } from "../utils/networkUtils";
import ocrWorkout from "../utils/ocrWorkout";
import { CARDIO_WORKOUTS, ERROR_MESSAGES, INTENSITY_ZONE } from "../../config/constants";
import { WorkoutName } from "@prisma/client";

async function processCardioWorkout(attachment: any, workoutName: WorkoutName, discordId: string) {
	const [ocrContent, user] = await Promise.all([
		ocrWorkout(attachment.url),
		prisma.user.findUnique({ where: { discord_id: discordId } }),
	]);

	if (!ocrContent) {
		throw new Error(ERROR_MESSAGES.OCR_FAILED);
	}

	if (!user) {
		throw new Error(ERROR_MESSAGES.USER_NOT_REGISTERED);
	}

	const { birth: birthDate, restingHeartRate } = user;

	if (!birthDate || !restingHeartRate) {
		throw new Error(ERROR_MESSAGES.MISSING_USER_INFO);
	}

	const [minuteStr, heartRateStr] = ocrContent.split(", ").map((numStr) => numStr.trim());
	const minute = parseInt(minuteStr, 10);
	const heartRate = parseInt(heartRateStr, 10);

	if (isNaN(minute) || isNaN(heartRate)) {
		throw new Error(ERROR_MESSAGES.INVALID_WORKOUT_DATA);
	}

	const age = calculateAge(new Date(birthDate));
	const HRM = calculateHRM(age);
	const intensityZone = getExerciseIntensityZone(HRM, restingHeartRate);
	const exerciseIntensityZone = determineExerciseIntensityZone(heartRate, HRM, restingHeartRate);
	const intensityZoneIndex = exerciseIntensityZone
		? exerciseIntensityZone
		: exerciseIntensityZone + 1;
	const dailyRating = calculatePointDailyRating(minute, intensityZoneIndex);
	const point = calculatePoint(dailyRating);

	await prisma.workouts.create({
		data: {
			userId: user.id,
			category: "CARDIO",
			workoutName,
			minute,
			heartRate,
			point,
			intensityZone: intensityZoneIndex,
			dailyLoad: dailyRating,
			image: attachment.url,
			createdAt: getCurrentDateWithTimezoneOffset(),
		},
	});

	const [imageBuffer, { scoresByWorkout, totalScore }, intervalWorkoutCount] = await Promise.all([
		downloadImageAsBuffer(attachment.url),
		getCardioWorkoutScores(discordId),
		getIntervalWorkoutCount(discordId),
	]);

	const logoPath = path.join(__dirname, "../../public/logo.png");
	const chartImageBuffer = await createDonutChartBuffer(
		scoresByWorkout,
		totalScore,
		100,
		intervalWorkoutCount,
		logoPath
	);

	const replyContent = `\`${
		CARDIO_WORKOUTS[workoutName as keyof typeof CARDIO_WORKOUTS]
	} 운동\` 으로 포인트 \`${point}pt\` 획득하셨습니다.\n나이와 심폐기능을 고려한 평균 운동강도 \`'${
		INTENSITY_ZONE[intensityZoneIndex - 1]
	}'\`${
		!exerciseIntensityZone
			? `\n평균 심박수가 너무 낮았어요. 다음엔 최소 \`${Math.ceil(
					intensityZone[0].lower
			  )}BPM\` 이상을 유지해보세요!`
			: ""
	}\n\n이번주 총 유산소 포인트 : **${roundToDecimal(totalScore, 1)}pt**`;

	return {
		files: [new AttachmentBuilder(chartImageBuffer!), new AttachmentBuilder(imageBuffer)],
		content: replyContent,
	};
}

export { processCardioWorkout };
