import axios from "axios";

export async function downloadImageAsBuffer(url: string): Promise<Buffer> {
	const response = await axios.get(url, { responseType: "arraybuffer" });
	return Buffer.from(response.data, "binary");
}
