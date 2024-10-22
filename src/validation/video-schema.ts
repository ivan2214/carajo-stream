import { z } from "zod";

export const VideoSchema = z.object({
	videoId: z.string(),
	publishedAt: z.string(),
	title: z.string(),
	description: z.string(),
	formattedDuration: z.string(),
	url: z.string().url(),
	channelTitle: z.string(),
	thumbnails: z.object({
		default: z.object({
			url: z.string().url(),
			width: z.number(),
			height: z.number(),
		}),
		medium: z.object({
			url: z.string().url(),
			width: z.number(),
			height: z.number(),
		}),
		high: z.object({
			url: z.string().url(),
			width: z.number(),
			height: z.number(),
		}),
		standard: z.object({
			url: z.string().url(),
			width: z.number(),
			height: z.number(),
		}),
		maxres: z.object({
			url: z.string().url(),
			width: z.number(),
			height: z.number(),
		}),
	}),
	videoType: z.enum(["short", "video", "live", "upcoming", "streams"]),
});
