import { createCanvas, Image } from "canvas";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { UserData } from "../dataUtils";
import {
	BarController,
	BarElement,
	CategoryScale,
	Chart,
	ChartConfiguration,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from "chart.js";
import { roundToDecimal } from "../mathUtils";

Chart.register(
	BarController,
	BarElement,
	CategoryScale,
	LinearScale,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels
);

const CHART_WIDTH = 1440;
const CHART_HEIGHT = 820;
const MAX_BAR_THICKNESS = 50;
const CHART_TITLE = "FITCURATOR PROJECT 주간 포인트(pt)";
const CHART_ASPECT_RATIO = 5 / 3;

function getRgbaColorForPoints(points: number): string {
	if (points >= 200) {
		return "rgba(27, 171, 120, 1)";
	} else if (points >= 100) {
		return "rgba(149, 200, 62, 1)";
	} else if (points >= 50) {
		return "rgba(206, 207, 50, 1)";
	} else {
		return "rgba(207, 125, 50, 1)";
	}
}

function getBarThickness(dataLength: number): number {
	return Math.min(CHART_HEIGHT / dataLength / 2, MAX_BAR_THICKNESS);
}

function createChartConfiguration(
	data: UserData[],
	barThickness: number
): ChartConfiguration<"bar", number[], string> {
	return {
		type: "bar",
		data: {
			labels: data.map((user) => user.name || "미등록사용자"),

			datasets: [
				{
					data: data.map((user) => roundToDecimal(user.totalPoints, 1)),
					backgroundColor: data.map((user) => getRgbaColorForPoints(user.totalPoints)),
					borderWidth: 1,
					barThickness: barThickness,
					borderRadius: 8,
				},
			],
		},
		options: {
			indexAxis: "y",
			layout: {
				padding: {
					top: 24,
					right: 20,
					bottom: 32,
					left: 20,
				},
			},
			responsive: true,
			plugins: {
				datalabels: {
					color: "white",
					align: "end",
					anchor: "end",
					offset: 8,
					formatter: (value, context) => {
						const user = data[context.dataIndex];
						return `${value.toString()}pt (${user.intervalWorkoutCount}회)`;
					},
					font: {
						weight: "bold",
						size: 16,
					},
				},

				legend: {
					display: false,
				},
				title: {
					display: true,
					text: CHART_TITLE,
					color: "#ffffff",
					font: { weight: "bold", size: 20 },
				},
			},
			scales: {
				y: {
					ticks: {
						color: "#ffffff",
						font: {
							size: 18,
						},
					},
					grid: {
						drawOnChartArea: true,
					},
				},
				x: {
					border: {
						display: false,
					},
					grid: {
						drawOnChartArea: true,
					},
				},
			},
			aspectRatio: CHART_ASPECT_RATIO,
		},
	};
}

function renderChartToBuffer(configuration: ChartConfiguration<"bar", number[], string>): Buffer {
	const offscreenCanvas = createCanvas(CHART_WIDTH, CHART_HEIGHT);
	const offscreenCtx = offscreenCanvas.getContext("2d");

	new Chart(offscreenCtx as unknown as HTMLCanvasElement, configuration);

	const canvas = createCanvas(CHART_WIDTH, CHART_HEIGHT);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "rgba(30,30,30,1)";
	ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

	ctx.drawImage(offscreenCanvas, 0, 0);

	return canvas.toBuffer("image/png");
}

export async function createChartBuffer(data: UserData[]): Promise<Buffer | null> {
	if (data.length === 0) {
		return null;
	}

	const barThickness = getBarThickness(data.length);
	const configuration = createChartConfiguration(data, barThickness);
	return renderChartToBuffer(configuration);
}
