import {
	Image,
	CanvasRenderingContext2D as NodeCanvasRenderingContext2D,
	createCanvas,
} from "canvas";
import {
	ArcElement,
	Chart,
	ChartConfiguration,
	ChartData,
	DoughnutController,
	Legend,
	Plugin,
	Tooltip,
} from "chart.js";
import { roundToDecimal } from "../mathUtils";
import { CARDIO_WORKOUTS } from "../../../config/constants";

interface DoughnutLabelOptions {
	displayLabels: boolean;
}

interface DoughnutLabelPluginOptions extends DoughnutLabelOptions {
	totalScore: number;
	maxScore: number;
	intervalWorkoutCount: number;
}

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const CHART_WIDTH = 1440;
const CHART_HEIGHT = 1440;

function loadPngImage(imagePath: string): Promise<{ img: Image; width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve({ img, width: img.width, height: img.height });
		img.onerror = reject;
		img.src = imagePath;
	});
}

async function drawLogo(
	ctx: NodeCanvasRenderingContext2D,
	xCoor: number,
	yCoor: number,
	imagePath: string
) {
	try {
		const { img, width, height } = await loadPngImage(imagePath);
		const logoX = xCoor - width / 4 / 2;
		const logoY = yCoor - height / 4 / 2 - 160;
		ctx.drawImage(img, logoX, logoY, width / 4, height / 4);
	} catch (error) {
		console.error("Error loading PNG image: ", error);
	}
}

function getDonutChartData(
	scoresByWorkout: { [key: string]: number },
	totalScore: number,
	maxScore: number
): ChartData<"doughnut", number[], string> {
	const adjustedTotalScore = Math.min(totalScore, maxScore);
	const labels = Object.keys(scoresByWorkout);
	const data = Object.values(scoresByWorkout);
	const remainingPercentage = Math.max(maxScore - adjustedTotalScore, 0);
	return {
		labels: [...labels, ""],
		datasets: [
			{
				data: [...data, remainingPercentage],
				backgroundColor: [...data.map(() => randomColorForData()), "rgba(98, 98, 98, 1)"],
			},
		],
	};
}

function randomColorForData(): string {
	const red = Math.floor(Math.random() * 128 + 128);
	const green = Math.floor(Math.random() * 128 + 128);
	const blue = Math.floor(Math.random() * 128 + 128);
	const alpha = 1;

	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function getDonutChartOptions(
	datalabels: string[],
	totalScore: number,
	maxScore: number,
	intervalWorkoutCount: number
): ChartConfiguration["options"] {
	const doughnutLabel: Plugin<"doughnut"> = {
		id: "doughnutLabel",
		beforeDatasetsDraw(chart, args, pluginOptions) {
			const options = pluginOptions as DoughnutLabelPluginOptions;

			if (!options || !options?.displayLabels) {
				return;
			}

			const { ctx } = chart;
			ctx.save();
			const xCoor = chart.getDatasetMeta(0).data[0].x;
			const yCoor = chart.getDatasetMeta(0).data[0].y;

			ctx.font = "semibold 40px sans-serif";
			ctx.fillStyle = "white";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("이번주 유산소 운동", xCoor, yCoor - 84);

			ctx.font = "bold 112px sans-serif";
			ctx.fillText(
				`${roundToDecimal((options.totalScore / options.maxScore) * 100, 1)}%`,
				xCoor,
				yCoor + 24
			);
			ctx.font = "semibold 40px sans-serif";
			ctx.fillText(`근력운동 ${options.intervalWorkoutCount}회`, xCoor, yCoor + 124);

			ctx.restore();
		},
	};

	Chart.register(doughnutLabel);

	return {
		responsive: true,
		layout: {
			padding: {
				top: 64,
				right: 64,
				bottom: 64,
				left: 64,
			},
		},
		plugins: {
			legend: {
				display: false,
			},
			datalabels: {
				color: "black",
				align: "center",
				textAlign: "center",
				formatter: (value, context) => {
					if (datalabels.length === context.dataIndex) return "";
					const workoutName = datalabels[context.dataIndex];
					return [
						CARDIO_WORKOUTS[workoutName as keyof typeof CARDIO_WORKOUTS],
						`${roundToDecimal((value / maxScore) * 100, 1)}%`,
					];
				},
				font: {
					weight: "bold",
					size: 40,
					lineHeight: 1.4,
				},
			}, //@ts-ignore
			doughnutLabel: {
				displayLabels: true,
				totalScore: totalScore,
				maxScore: maxScore,
				intervalWorkoutCount: intervalWorkoutCount,
			},
		},
	};
}

async function renderChartToBuffer(
	chartData: ChartData<"doughnut", number[], string>,
	chartOptions: ChartConfiguration["options"],
	imagePath: string
): Promise<Buffer> {
	const offscreenCanvas = createCanvas(CHART_WIDTH, CHART_HEIGHT);
	const offscreenCtx = offscreenCanvas.getContext("2d");

	new Chart(offscreenCtx as unknown as HTMLCanvasElement, {
		type: "doughnut",
		data: chartData,
		options: chartOptions,
	});

	const xCoor = offscreenCanvas.width / 2;
	const yCoor = offscreenCanvas.height / 2;

	await drawLogo(offscreenCtx, xCoor, yCoor, imagePath);

	const canvas = createCanvas(CHART_WIDTH, CHART_HEIGHT);
	const ctx = canvas.getContext("2d");

	ctx.fillStyle = "rgba(30,30,30,1)";
	ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

	ctx.drawImage(offscreenCanvas, 0, 0);

	return canvas.toBuffer("image/png");
}

export async function createDonutChartBuffer(
	scoresByWorkout: { [key: string]: number },
	totalScore: number,
	maxScore: number,
	intervalWorkoutCount: number,
	imagePath: string
): Promise<Buffer | null> {
	if (Object.keys(scoresByWorkout).length === 0) {
		return null;
	}

	const chartData = getDonutChartData(scoresByWorkout, totalScore, maxScore);
	const chartOptions = getDonutChartOptions(
		Object.keys(scoresByWorkout),
		totalScore,
		maxScore,
		intervalWorkoutCount
	);
	return renderChartToBuffer(chartData, chartOptions, imagePath);
}
