export const CARDIO_WORKOUTS = {
	WALKING: "걷기",
	HIIT: "HIIT",
	RUNNING: "달리기",
	CLIMBING: "등산",
	CYCLING: "사이클",
	SWIMMING: "수영",
	STEPPER: "스텝퍼",
	SPINNING: "스피닝",
	SOCCER: "축구",
	TENNIS: "테니스",
	PICKLEBALL: "피클볼",
	OTHER: "기타",
};

export const CARDIO_WORKOUT_CHOICES = Object.entries(CARDIO_WORKOUTS).map(([value, name]) => ({
	name,
	value,
}));

export const INTERVAL_WORKOUT_CHOICES = [
	{ name: "웨이트 트레이닝", value: "WEIGHT_TRAINING" },
	{ name: "기능성 근력 강화 운동", value: "FUNCTIONAL_STRENGTH_TRAINING" },
	{ name: "필라테스", value: "PILATES" },
	{ name: "요가", value: "YOGA" },
	{ name: "기타", value: "OTHER" },
];

export const ERROR_MESSAGES = {
	UNEXPECTED_ERROR: "처리할 수 없는 이미지입니다. 다시 한 번 확인해주세요.",
	OCR_FAILED: "분석에 실패했습니다. 다시 시도해주세요.",
	USER_NOT_REGISTERED: "등록되지 않은 사용자입니다. 등록 절차를 진행해주세요.",
	MISSING_USER_INFO: "사용자의 생년월일 또는 안정시 심박수 정보가 필요합니다.",
	INVALID_WORKOUT_DATA: "올바른 형식의 데이터를 추출하지 못했습니다. 다시 시도해주세요.",
	INSUFFICIENT_INTERVAL_WORKOUT_DURATION:
		"근력 운동의 시간이 너무 적어요! 근력 운동은 최소 30분 이상만 등록이 가능해요.",
	INVALID_BIRTH_DATE_FORMAT: "올바르지 않은 생년월일 형식입니다.",
	DATABASE_ERROR: "데이터베이스 오류가 발생했습니다. 나중에 다시 시도해주세요.",
};

export const INTENSITY_ZONE = ["매우 낮음", "낮음", "중간", "높음", "매우높음"];
