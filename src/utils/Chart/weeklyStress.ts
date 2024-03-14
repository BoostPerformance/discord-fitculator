import { createCanvas } from "canvas";
import { Chart, ChartConfiguration, registerables } from "chart.js";

Chart.register(...registerables);

const CHART_WIDTH = 1600;
const CHART_HEIGHT = 1200;
const MAX_BAR_THICKNESS = 364;

interface WeeklyLoad {
	week: string;
	totalLoad: number;
	stress: number;
}

function getBarThickness(dataLength: number): number {
	return Math.min(CHART_HEIGHT / dataLength / 2, MAX_BAR_THICKNESS);
}

function createBarChartData(
	weeklyLoads: WeeklyLoad[],
	barThickness: number
): ChartConfiguration<"bar"> {
	const labels = weeklyLoads.map((_, index) => `W${index + 1}`);
	const totalLoadData = weeklyLoads.map((load) => load.totalLoad);
	const stressData = weeklyLoads.map((load) => load.stress);

	return {
		type: "bar",
		data: {
			labels,
			datasets: [
				{
					label: "주차별 총 부하량",
					data: totalLoadData,
					backgroundColor: "rgba(31, 170, 207, 1)",
					borderColor: "(31, 170, 207, 0.7)",
					borderWidth: 1,
					borderRadius: 12,
					barThickness: barThickness,
					order: 1,
				},
				{
					label: "주별 스트레스",
					data: stressData,
					borderColor: "red",
					borderWidth: 8,
					//@ts-ignore
					type: "line",
					fill: false,
					// tension: 0.6,
					order: 0,
				},
			],
		},
		options: {
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
				// datalabels: {
				// 	color: "white",
				// 	align: "center",
				// 	formatter: (value, _) => {
				// 		return value.toString();
				// 	},
				// 	font: {
				// 		weight: "bold",
				// 		size: 16,
				// 	},
				// },
				datalabels: {
					display: false,
				},

				legend: {
					display: false,
				},
			},
			scales: {
				y: {
					ticks: {
						display: false,
					},
					grid: {
						drawOnChartArea: true,
					},
					beginAtZero: true,
				},
				x: {
					ticks: {
						color: "#ffffff", // x축 라벨 하얀색으로 설정
						font: {
							weight: 600,
							size: 28,
						},
					},
					border: {
						display: false,
					},
					grid: {
						drawOnChartArea: true,
					},
				},
			},
		},
	};
}

async function renderChartToBuffer(configuration: ChartConfiguration<"bar">): Promise<Buffer> {
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
export async function createWeeklyStressChartBuffer(weeklyLoads: WeeklyLoad[]): Promise<Buffer> {
	const barThickness = getBarThickness(weeklyLoads.length);
	const chartConfig = createBarChartData(weeklyLoads, barThickness);
	return renderChartToBuffer(chartConfig);
}
