import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { prisma } from "../db";
import formatIntensityZones from "../utils/dataUtils";
import { calculateAge, calculateHRM, getExerciseIntensityZone } from "../utils/fitnessUtils";

/**
 * 심박구간을 확인하는 명령어 객체입니다.
 * @type {SlashCommandBuilder}
 */
const checkIntensityZone = {
	...new SlashCommandBuilder()
		.setName("심박구간")
		.setDescription("심박구간을 요청합니다")
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
				.addChoices({ name: "4기", value: "4" }, { name: "3기", value: "4" })
		),

	/**
	 * 심박구간을 확인하는 비동기 함수입니다.
	 * @async
	 * @param {ChatInputCommandInteraction} interaction - 명령어 상호작용 객체
	 */
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.deferReply();

			const name = interaction.options.getString("이름", true);
			const grade = interaction.options.getString("기수", true);

			// 사용자 정보 조회
			const userExists = await prisma.user.findFirst({
				where: {
					name: name,
					year: { some: { year: { grade: grade } } },
				},
			});

			if (!userExists) {
				await interaction.editReply("아직 등록이 진행되지 않은 유저입니다.");
				return;
			}

			const { birth: birthDate, restingHeartRate } = userExists;

			if (!birthDate || !restingHeartRate) {
				await interaction.editReply("사용자의 생년월일 또는 안정시 심박수 정보가 필요합니다.");
				return;
			}

			// 운동 강도 구간 계산
			const age = calculateAge(new Date(birthDate));
			const HRM = calculateHRM(age);
			const intensityZone = getExerciseIntensityZone(HRM, restingHeartRate);

			// 심박구간 포맷팅
			const formatedZones = formatIntensityZones(intensityZone);

			// 결과 메시지 전송
			await interaction.editReply(`\`${userExists.name} - ${grade}기\`\n\n${formatedZones}`);
		} catch (error) {
			console.log(error);
			await interaction.editReply("명령을 처리하는 중 에러가 발생했어요.");
		}
	},
};

export default checkIntensityZone;
