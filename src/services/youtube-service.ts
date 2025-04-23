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
import fileCache from "@/utils/fileCache";
import { VideoSchema } from "@/validation/video-schema";

const CACHE_KEY = "youtubeVideosCache";
// 15 minutos de duracion
const CACHE_DURATION = 15 * 60; // 15 minutos en segundos

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
}: {
  maxResults?: number;
}): Promise<CategorizedVideos> {
  try {
    // Verificar si el sistema de caché está disponible
    if (fileCache.isCacheAvailable()) {
      // Verificar si ya hay datos en el caché de archivos
      const cachedData = await fileCache.get(CACHE_KEY);

      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } else {
      console.log(
        "Sistema de caché no disponible, obteniendo datos directamente de la API"
      );
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
        scheduledStartTime: snippet.publishedAt,
      };

      if (liveBroadcastContent === "upcoming") {
        const nowUTC = new Date(); // Hora actual en UTC
        const publishedAt = new Date(snippet.publishedAt); // Convertir publishedAt a un objeto Date

        // Calcula la diferencia en milisegundos
        const timeRemaining = publishedAt.getTime() - nowUTC.getTime(); // Ahora funciona correctamente

        if (timeRemaining > 0) {
          // Verifica si el evento aún no ha comenzado
          const totalMinutes = Math.floor(timeRemaining / (1000 * 60)); // Total de minutos
          const hours = Math.floor(totalMinutes / 60); // Horas restantes
          const minutes = totalMinutes % 60; // Minutos restantes

          videoData.timeToStart = `${hours} horas y ${minutes} minutos`;
        }
      }

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

    // Intentar guardar los datos en el caché si está disponible
    if (fileCache.isCacheAvailable()) {
      try {
        await fileCache.setEx(
          CACHE_KEY,
          CACHE_DURATION,
          JSON.stringify(categorizedVideos)
        );
      } catch (cacheError) {
        console.error(
          "Error al guardar en caché, continuando sin caché:",
          cacheError
        );
      }
    }

    return categorizedVideos;
  } catch (error) {
    console.error("Error al obtener los videos:", error);
    return { shorts: [], videos: [], live: null, upcomings: [], streams: [] };
  }
}
