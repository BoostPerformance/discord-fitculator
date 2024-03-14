import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { prisma } from "../../src/db";

const sendRankGraph = () => {
	return cron.schedule("1-5 * * * * ", () => {
		console.log("스케쥴러 실행");
	});
};

export default sendRankGraph;
