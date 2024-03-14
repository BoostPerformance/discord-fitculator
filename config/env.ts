import dotenv from "dotenv";

dotenv.config();

export const TOKEN = process.env.DISCORD_TOKEN!;
export const CLIENT_ID = process.env.CLIENT_ID!;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
