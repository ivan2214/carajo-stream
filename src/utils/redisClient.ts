import { createClient } from "redis";

const redisClient = createClient({
	password: import.meta.env.REDIS_PASSWORD,
	socket: {
		host: import.meta.env.REDIS_HOST,
		port: import.meta.env.REDIS_PORT,
	},
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Conectar a Redis
(async () => {
	await redisClient.connect();
})();

export default redisClient;
