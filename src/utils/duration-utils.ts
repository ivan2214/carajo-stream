// durationUtils.ts

import type { VideoItem } from "@/types";

export function parseDuration(duration: string | undefined): string {
	if (!duration || typeof duration !== "string") {
		console.error("Invalid duration:", duration);
		return "00:00";
	}
	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

	if (!match) return "00:00";

	let hours = match[1] ? match[1].replace("H", "") : "0";
	let minutes = match[2] ? match[2].replace("M", "") : "0";
	let seconds = match[3] ? match[3].replace("S", "") : "0";

	hours = Number.parseInt(hours, 10).toString().padStart(2, "0");
	minutes = Number.parseInt(minutes, 10).toString().padStart(2, "0");
	seconds = Number.parseInt(seconds, 10).toString().padStart(2, "0");

	return hours === "00"
		? `${minutes}:${seconds}`
		: `${hours}:${minutes}:${seconds}`;
}

export function getDurationInSeconds(duration: string | undefined): number {
	if (!duration || typeof duration !== "string") {
		console.error("Invalid duration:", duration);
		return 0;
	}

	const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
	if (!match) return 0;

	const hours = match[1] ? Number.parseInt(match[1].replace("H", ""), 10) : 0;
	const minutes = match[2] ? Number.parseInt(match[2].replace("M", ""), 10) : 0;
	const seconds = match[3] ? Number.parseInt(match[3].replace("S", ""), 10) : 0;

	return hours * 3600 + minutes * 60 + seconds;
}

export function classifyVideoByDuration(
	durationInSeconds: number,
): VideoItem["videoType"] {
	console.log(durationInSeconds);
	
	if (durationInSeconds === 0) return "upcoming"; // Próximas emisiones
	if (durationInSeconds > 3600) return "streams"; // Directos (más de 1 hora)
	if (durationInSeconds >= 180) return "video"; // Videos (más de 3 minutos)
	return "short"; // Shorts (menos de 3 minutos)
}
