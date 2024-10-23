/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
	readonly YOUTUBE_API_KEY: string;
	readonly YOUTUBE_CHANNEL_ID: string;
	// más variables de entorno...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
