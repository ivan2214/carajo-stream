import type {
	CategorizedVideos,
	Item,
	ResponseVideoDetails,
	ResponseYoutube,
	VideoItem,
} from "@/types";
import {
	classifyVideoByDuration,
	getDurationInSeconds,
	parseDuration,
} from "@/utils/duration-utils";
import { VideoSchema } from "@/validation/video-schema";
import pLimit from "p-limit";

const API_KEY = import.meta.env.YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.YOUTUBE_CHANNEL_ID;

const limit = pLimit(2);
 
// Función para obtener detalles de los videos
async function getVideoDetails(videoIds: string[]): Promise<Item[]> {
	try {
		const ids = videoIds?.join(",");
		const YOUTUBE_VIDEO_DETAILS_URL = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${ids}&part=snippet,contentDetails`;
		const response = await limit(()=>fetch(YOUTUBE_VIDEO_DETAILS_URL, {
			cache: "force-cache",
		}))

		const data = await response.json();

		const { items }: ResponseVideoDetails = data;

		if (items && data?.items?.length > 0) return items;

		return [];
	} catch (error) {
		console.error("Error al obtener los detalles de los videos:", error);
		return [];
	}
}

// Modificar la función para aceptar un parámetro maxResults
export async function getAllVideos({
	maxResults = 10,
}: { maxResults?: number }): Promise<CategorizedVideos> {
	try {
		// Modificar la URL para incluir maxResults
		const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=${maxResults}`;
		const response = await limit(()=>fetch(YOUTUBE_API_URL, {
			cache:"force-cache"
		}))

		const data: ResponseYoutube = await response.json();
		const { items } = data;

		const categorizedVideos: CategorizedVideos = {
			shorts: [],
			videos: [],
			streams: [],
			upcomings: [],
			live: null,
		};

		if (items?.length === 0) {
			
			return categorizedVideos
		};

		const videoIds = items?.map((item) => item.id.videoId);
		const videoDetails = await getVideoDetails(videoIds);

		for (const detail of videoDetails) {
			const { id: videoId, snippet, contentDetails } = detail;
			const { title, description, publishedAt, channelTitle, thumbnails } =
				snippet;
			const durationInSeconds = getDurationInSeconds(contentDetails.duration);
			const videoType = classifyVideoByDuration(durationInSeconds);
			
			const {liveBroadcastContent} = detail.snippet
			

			const videoData: VideoItem = {
				videoId,
				publishedAt,
				title,
				videoType,
				description,
				formattedDuration: parseDuration(contentDetails.duration),
				url: `https://www.youtube.com/watch?v=${videoId}`,
				channelTitle,
				thumbnails,
			};
			const validationResult = VideoSchema.safeParse(videoData);

			if (validationResult.success) {
				if (videoType === "short") categorizedVideos.shorts.push(videoData);
				else if (videoType === "video")
					categorizedVideos.videos.push(videoData);
				else if (videoType === "live" ||liveBroadcastContent === "live" ) categorizedVideos.live = videoData;
				else if (videoType === "streams")
					categorizedVideos.streams.push(videoData);
				else if (videoType === "upcoming")
					categorizedVideos.upcomings.push(videoData);
			} else {
				console.error("Error al validar el video:", validationResult.error);
			}
		}
		return categorizedVideos;
	} catch (error) {
		console.error("Error al obtener los videos:", error);
		return { shorts: [], videos: [], live: null, upcomings: [], streams: [] };
	}
}
