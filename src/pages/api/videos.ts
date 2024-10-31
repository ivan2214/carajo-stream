// /pages/api/videos.ts

import { getAllVideos } from "@/services/youtube-service";
import type { APIRoute } from "astro";

const VIDEO_URL = "https://www.youtube.com/@CarajoStream/videos";

export const GET: APIRoute = async () => {
	try {
		const videos = await getAllVideos({
			maxResults: 25,
		});

		if (!videos) {
			return new Response(
				JSON.stringify({
					message: "Faltan campos requeridos",
				}),
				{ status: 400 },
			);
		}

		return new Response(JSON.stringify(videos), { status: 200 });
	} catch (error) {
		console.error("Error al obtener los videos:", error);
		return new Response(
			JSON.stringify({ error: "Error al obtener los videos" }),
			{ status: 500 },
		);
	}
};
