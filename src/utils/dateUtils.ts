import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

export function getCurrentDateUTC(timezoneOffsetHours: number = 9): Date {
	const now = new Date();
	now.setHours(now.getHours() + timezoneOffsetHours);
	return dayjs.utc(now).toDate();
}

export function parseDateFromString(dateString: string): Date | null {
	if (!/^\d{8}$/.test(dateString)) {
		return null;
	}

	const year = parseInt(dateString.slice(0, 4), 10);
	const month = parseInt(dateString.slice(4, 6), 10) - 1;
	const day = parseInt(dateString.slice(6, 8), 10);

	const parsedDate = dayjs.utc(new Date(year, month, day));
	if (!parsedDate.isValid()) {
		return null;
	}

	return parsedDate.toDate();
}

export function formatDateISO(date: Date): string {
	const year = date.getFullYear().toString();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function getStartAndEndOfWeek(date: Date = new Date()): {
	startOfWeek: Date;
	endOfWeek: Date;
} {
	date.setHours(date.getHours() + 9);
	const current = dayjs.utc(date).startOf("day");
	const dayOfWeek = current.day();
	const startOfWeek =
		dayOfWeek === 0 ? current.subtract(6, "day") : current.subtract(dayOfWeek - 1, "day");
	const endOfWeek = startOfWeek.add(6, "day").endOf("day");

	return { startOfWeek: startOfWeek.toDate(), endOfWeek: endOfWeek.toDate() };
}

export function getCurrentDateWithTimezoneOffset(timezoneOffsetHours: number = 9) {
	const now = new Date();
	now.setHours(now.getHours() + timezoneOffsetHours);
	return now;
}
