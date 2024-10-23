import type {
	CategorizedVideos,
	Item,
	ResponseVideoDetails,
	ResponseYoutube,
	VideoItem,
} from "@/types";
import { timeAgo } from "@/utils/date-util";
import {
	classifyVideoByDuration,
	getDurationInSeconds,
	parseDuration,
} from "@/utils/duration-utils";
import redisClient from "@/utils/redisClient";
import { VideoSchema } from "@/validation/video-schema";

const CACHE_KEY = "youtubeVideosCache";
const CACHE_DURATION = 24 * 60 * 60; // 24 horas en segundos

const API_KEY = import.meta.env.YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.YOUTUBE_CHANNEL_ID;

// Función para obtener detalles de los videos (sin cambios aquí)
async function getVideoDetails(videoIds: string[]): Promise<Item[]> {
	try {
		const ids = videoIds?.join(",");
		const YOUTUBE_VIDEO_DETAILS_URL = `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${ids}&part=snippet,contentDetails`;
		const response = await fetch(YOUTUBE_VIDEO_DETAILS_URL, {
			cache: "force-cache",
		});

		const data = await response.json();
		const { items }: ResponseVideoDetails = data;

		if (items && data?.items?.length > 0) return items;

		return [];
	} catch (error) {
		console.error("Error al obtener los detalles de los videos:", error);
		return [];
	}
}

// Modificar la función para aceptar un parámetro maxResults y usar Redis
export async function getAllVideos({
	maxResults = 10,
}: { maxResults?: number }): Promise<CategorizedVideos> {
	try {
		// Verificar si ya hay cache en Redis
		const cachedData = await redisClient.get(CACHE_KEY);

		if (cachedData) {
			// Si el cache existe y es válido, devolver los datos cacheados
			console.log(
				"Usando datos del cache de Redis no vuelvo a hacer la petición",
			);
			return JSON.parse(cachedData);
		}

		// Si no hay cache, hacer la solicitud a la API
		const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&order=date&maxResults=${maxResults}`;
		const response = await fetch(YOUTUBE_API_URL, {
			cache: "force-cache",
		});

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
			return categorizedVideos;
		}

		const videoIds = items?.map((item) => item.id.videoId);
		const videoDetails = await getVideoDetails(videoIds);

		for (const detail of videoDetails) {
			const { id: videoId, snippet, contentDetails } = detail;
			const { title, description, publishedAt, channelTitle, thumbnails } =
				snippet;
			const durationInSeconds = getDurationInSeconds(contentDetails.duration);
			const videoType = classifyVideoByDuration(durationInSeconds);

			const { liveBroadcastContent } = detail.snippet;

			const videoData: VideoItem = {
				videoId,
				publishedAt: timeAgo(publishedAt),
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
				else if (videoType === "live" || liveBroadcastContent === "live")
					categorizedVideos.live = videoData;
				else if (videoType === "streams")
					categorizedVideos.streams.push(videoData);
				else if (videoType === "upcoming")
					categorizedVideos.upcomings.push(videoData);
			} else {
				console.error("Error al validar el video:", validationResult.error);
			}
		}

		// Contar el número total de videos (shorts, videos, streams, live)
		const totalVideos =
			categorizedVideos.shorts.length +
			categorizedVideos.videos.length +
			categorizedVideos.streams.length +
			(categorizedVideos.live ? 1 : 0);

		// Solo guardar en Redis si hay al menos 25 videos en total
		if (totalVideos >= 25) {
			// Guardar los datos en Redis con un TTL de 24 horas
			await redisClient.setEx(
				CACHE_KEY,
				CACHE_DURATION,
				JSON.stringify(categorizedVideos),
			);
			console.log(`Datos guardados en Redis (${totalVideos} videos en total)`);
		} else {
			console.log(
				`No se guardan datos en Redis, solo hay ${totalVideos} videos.`,
			);
		}

		return categorizedVideos;
	} catch (error) {
		console.error("Error al obtener los videos:", error);
		return { shorts: [], videos: [], live: null, upcomings: [], streams: [] };
	}
}
