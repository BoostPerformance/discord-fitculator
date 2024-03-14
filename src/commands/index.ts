import checkIntensityZone from "./checkIntensityZone";
import insertUserInfo from "./insertUserInfo/userInfo";
import insertIntervalWorkoutResult from "./insertWokroutResult/IntervalWorkout";
import insertCardioWorkoutResult from "./insertWokroutResult/cardioWorkout";
import question from "./question";
import weeklyCardioWorkoutPoints from "./readDataWithGraph/weeklyCardioWorkoutPoint";
import weklyStress from "./readDataWithGraph/weeklyStress";
import weeklyWorkoutPoints from "./readDataWithGraph/weeklyWorkoutPoints";
import insertRestingRate from "./updateUserInfo/RestingDate";
import insertBirthDate from "./updateUserInfo/birthDate";

const commands = [
	checkIntensityZone,
	insertUserInfo,
	insertIntervalWorkoutResult,
	insertCardioWorkoutResult,
	question,
	weeklyCardioWorkoutPoints,
	weklyStress,
	weeklyWorkoutPoints,
	insertRestingRate,
	insertBirthDate,
];

export default commands;
