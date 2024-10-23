import { createClient } from "redis";

const redisClient = createClient({
	url: "redis://localhost:6379", // URL de tu servidor Redis
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Conectar a Redis
(async () => {
	await redisClient.connect();
})();

export default redisClient;
