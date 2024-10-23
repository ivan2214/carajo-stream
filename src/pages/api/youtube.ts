import { getAllVideos } from "@/services/youtube-service";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
	try {
		const categorizedVideos = await getAllVideos({
			maxResults: 25,
		});
		return new Response(JSON.stringify(categorizedVideos), { status: 200 });
	} catch (error) {
		console.error("Error al obtener los videos:", error);
		return new Response(
			JSON.stringify({ error: "Error al obtener los videos" }),
			{ status: 500 },
		);
	}
};
