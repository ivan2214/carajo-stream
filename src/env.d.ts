/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
	readonly YOUTUBE_API_KEY: string;
	readonly YOUTUBE_CHANNEL_ID: string;
	readonly REDIS_PASSWORD: string;
	readonly REDIS_HOST: string;
	readonly REDIS_PORT: number;
	// más variables de entorno...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
