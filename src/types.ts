export interface CategorizedVideos {
	shorts: VideoItem[];
	videos: VideoItem[];
	live?: VideoItem | null;
	upcomings: VideoItem[];
	streams: VideoItem[];
}

export interface VideoItem {
	videoId: string;
	publishedAt: string;
	title: string;
	description: string;
	formattedDuration: string;
	url: string;
	channelTitle: string;
	thumbnails: Thumbnails;
	videoType: "short" | "video" | "live" | "upcoming" | "streams";
	scheduledStartTime?: string;
	timeToStart?: string;
}

// esto deevuelve la api de youtube para todos

export interface ResponseYoutube {
	items: YoutubeItem[];
}

export interface YoutubeItem {
	kind: string;
	etag: string;
	id: {
		videoId: string;
	};
	snippet: Snippet;
}

export interface Snippet {
	publishedAt: string;
	channelId: string;
	title: string;
	description: string;
	thumbnails: Thumbnails;
	channelTitle: string;
	tags: string[];
	categoryId: string;
	liveBroadcastContent: string;
	localized: { title: string; description: string };
	defaultAudioLanguage: string;
}

export interface Thumbnails {
	default: { url: string; width: number; height: number };
	medium: { url: string; width: number; height: number };
	high: { url: string; width: number; height: number };
	standard: { url: string; width: number; height: number };
	maxres: { url: string; width: number; height: number };
}

// esto devuelve la api de youtube con detalles

export interface ResponseVideoDetails {
	items: Item[];
}

export interface Item {
	kind: string;
	etag: string;
	id: string;
	snippet: Snippet;
	contentDetails: {
		duration: string;
		dimension: string;
		definition: string;
		caption: string;
		licensedContent: boolean;
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		contentRating: {};
		projection: string;
	};
}
