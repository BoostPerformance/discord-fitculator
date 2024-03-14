export function calculateMean(dataPoints: number[]): number {
	const total = dataPoints.reduce((acc, val) => acc + val, 0);
	return total / dataPoints.length;
}

export function calculateVariance(dataPoints: number[], mean: number): number {
	const sumOfSquares = dataPoints.reduce((acc, val) => acc + (val - mean) ** 2, 0);
	return sumOfSquares / dataPoints.length;
}

export function calculateStandardDeviation(dataPoints: number[]): number | null {
	if (dataPoints.length === 0) {
		return null;
	}

	const mean = calculateMean(dataPoints);
	const variance = calculateVariance(dataPoints, mean);
	return Math.sqrt(variance);
}

export function roundToDecimal(value: number, precision: number): number {
	const factor = Math.pow(10, precision);
	return Math.round(value * factor) / factor;
}
