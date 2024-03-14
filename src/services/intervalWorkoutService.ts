// intervalWorkoutService.ts
import { AttachmentBuilder } from "discord.js";
import { prisma } from "../db";
import { getIntervalWorkoutCount } from "../utils/dataUtils";
import { getCurrentDateWithTimezoneOffset } from "../utils/dateUtils";
import {
	calculateAge,
	calculateHRM,
	calculatePoint,
	calculatePointDailyRating,
	determineExerciseIntensityZone,
} from "../utils/fitnessUtils";
import { downloadImageAsBuffer } from "../utils/networkUtils";
import ocrWorkout from "../utils/ocrWorkout";
import { ERROR_MESSAGES } from "../../config/constants";
import { WorkoutName } from "@prisma/client";

async function processIntervalWorkout(
	attachment: any,
	workoutName: WorkoutName,
	discordId: string
) {
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

	if (minute < 30) {
		throw new Error(ERROR_MESSAGES.INSUFFICIENT_INTERVAL_WORKOUT_DURATION);
	}

	const age = calculateAge(new Date(birthDate));
	const HRM = calculateHRM(age);
	const intensityZoneIndex = determineExerciseIntensityZone(heartRate, HRM, restingHeartRate);
	const dailyRating = calculatePointDailyRating(intensityZoneIndex, minute);
	const point = calculatePoint(dailyRating);

	await prisma.workouts.create({
		data: {
			userId: user.id,
			category: "INTERVAL",
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

	const [intervalWorkoutCount, imageBuffer] = await Promise.all([
		getIntervalWorkoutCount(discordId),
		downloadImageAsBuffer(attachment.url),
	]);

	const userDisplayName = user.name || user.nickname || "사용자";

	return {
		files: [new AttachmentBuilder(imageBuffer)],
		content: `${userDisplayName}님, 이번주 근력운동을 ${intervalWorkoutCount}회 하셨어요!`,
	};
}

export { processIntervalWorkout };
