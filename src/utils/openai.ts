import OpenAI from "openai";
import { OPENAI_API_KEY } from "../../config/env";

declare global {
	var cachedOpenAi: OpenAI;
}

let openai: OpenAI;
if (process.env.NODE_ENV === "production") {
	openai = new OpenAI({
		apiKey: OPENAI_API_KEY,
	});
} else {
	if (!global.cachedOpenAi) {
		global.cachedOpenAi = new OpenAI({
			apiKey: OPENAI_API_KEY,
		});
	}
	openai = global.cachedOpenAi;
}

export { openai };
