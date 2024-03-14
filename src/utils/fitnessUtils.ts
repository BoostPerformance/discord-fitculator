// utils/index.ts
import { User } from "@prisma/client";
import { formatDateISO } from "./dateUtils";
import { roundToDecimal } from "./mathUtils";

interface IntensityZone {
	lower: number;
	upper: number;
	zone: number;
}

export function calculateAge(dob: Date): number {
	const today = new Date();
	const birthDate = new Date(dob);
	const age = today.getFullYear() - birthDate.getFullYear();
	const monthDifference = today.getMonth() - birthDate.getMonth();

	if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
		return age - 1;
	}

	return age;
}

export function calculateHRM(age: number): number {
	const hrmFactor = 0.64;
	const baseHRM = 211;
	return baseHRM - hrmFactor * age;
}

export function determineExerciseIntensityZone(
	currentHeartRate: number,
	HRM: number,
	RHR: number
): number {
	const intensityZones: IntensityZone[] = getExerciseIntensityZone(HRM, RHR);

	const zone = intensityZones.find(
		(z) => currentHeartRate >= z.lower && currentHeartRate <= z.upper
	);

	if (zone) {
		return zone.zone;
	}

	if (currentHeartRate < intensityZones[intensityZones.length - 1].lower) {
		return 0;
	} else {
		return 5;
	}
}

export function getExerciseIntensityZone(HRM: number, RHR: number): IntensityZone[] {
	const HRR = HRM - RHR;

	return [
		{ lower: 0.5 * HRR + RHR, upper: 0.6 * HRR + RHR, zone: 1 },
		{ lower: 0.6 * HRR + RHR, upper: 0.7 * HRR + RHR, zone: 2 },
		{ lower: 0.7 * HRR + RHR, upper: 0.8 * HRR + RHR, zone: 3 },
		{ lower: 0.8 * HRR + RHR, upper: 0.9 * HRR + RHR, zone: 4 },
		{ lower: 0.9 * HRR + RHR, upper: HRM, zone: 5 },
	];
}

export function calculatePointDailyRating(TI: number, T: number): number {
	return TI * T;
}

export function calculatePoint(DL: number): number {
	const pointConversionFactor = 2 / 9;
	const result = DL * pointConversionFactor;
	return roundToDecimal(result, 1);
}

export function calculateFatigue(
	weeklyTotalVolume: number,
	averageIntensity: number,
	standardDeviation: number
): number {
	return weeklyTotalVolume * (averageIntensity / standardDeviation);
}

export function calculateAcuteChronicWorkloadRatio(
	weeklyLoad: number,
	fourWeekAverageLoad: number
): number {
	return weeklyLoad / fourWeekAverageLoad;
}

export function buildReplyMessage(user: User) {
	const birthString = user.birth ? formatDateISO(user.birth) : "미등록";
	const name = user.name || user.nickname || "미등록";
	const ageString = user.birth ? `${calculateAge(user.birth)}세` : "미등록";
	const restingHeartRateString = user.restingHeartRate ? `${user.restingHeartRate}BPM` : "미등록";

	return `이름: ${name}
생년월일: ${birthString}
만 나이: ${ageString}
안정시 심박수: ${restingHeartRateString}`;
}
