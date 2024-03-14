import { openai } from "./openai";

const ocrWorkout = async (url: string): Promise<string | null> => {
	const response = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `** 너는 전설적인 OCR 전문가이자 한국어 전문가야. ** 
- 오로지 운동시간(Minute, 분 단위로 반올림)와 평균심박수(BPM, 세자리)을 두 가지 정보의 숫자만 순서대로 추출해줘. (example: 76, 120) 
- 운동시간과 심박수 중에 하나라도 알 수 없을 경우 추측하지마.`,
			},
			{
				role: "user",
				content: [
					{
						type: "text",
						text: `운동시간(Minute, 분 단위로 반올림)와 평균심박수(BPM)을 숫자만 순서대로 추출해줘.
###
예시1: 76, 130
예시2: 80, 129
###`,
					},
					{
						type: "image_url",
						image_url: { url: url, detail: "high" },
					},
				],
			},
		],
		temperature: 0.4,
		top_p: 1,
		model: "gpt-4-vision-preview",
	});

	if (!response || response.choices.length === 0) {
		return null;
	}

	return response.choices[0].message.content;
};

export default ocrWorkout;
