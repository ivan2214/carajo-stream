import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Obtener la ruta del directorio actual
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Directorio donde se almacenarán los archivos de caché
const CACHE_DIR = path.join(__dirname, "..", "..", "cache");

// Asegurarse de que el directorio de caché exista
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface CacheData {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any;
  expiry: number; // Timestamp de expiración
}

class FileCache {
  /**
   * Guarda datos en el caché con un tiempo de expiración
   * @param key Clave para identificar los datos
   * @param data Datos a guardar
   * @param ttl Tiempo de vida en segundos
   */
  async setEx(key: string, ttl: number, data: string): Promise<void> {
    const cacheFilePath = path.join(CACHE_DIR, `${key}.json`);
    const cacheData: CacheData = {
      data: JSON.parse(data),
      expiry: Date.now() + ttl * 1000, // Convertir TTL a milisegundos
    };

    try {
      await fs.promises.writeFile(
        cacheFilePath,
        JSON.stringify(cacheData),
        "utf8"
      );
      console.log(`Datos guardados en caché: ${key}`);
    } catch (error) {
      console.error(`Error al guardar en caché: ${key}`, error);
    }
  }

  /**
   * Obtiene datos del caché
   * @param key Clave para identificar los datos
   * @returns Datos almacenados o null si no existen o han expirado
   */
  async get(key: string): Promise<string | null> {
    const cacheFilePath = path.join(CACHE_DIR, `${key}.json`);

    try {
      // Verificar si el archivo existe
      if (!fs.existsSync(cacheFilePath)) {
        return null;
      }

      // Leer el archivo
      const fileContent = await fs.promises.readFile(cacheFilePath, "utf8");
      const cacheData: CacheData = JSON.parse(fileContent);

      // Verificar si los datos han expirado
      if (Date.now() > cacheData.expiry) {
        // Eliminar el archivo caducado
        await fs.promises.unlink(cacheFilePath);
        console.log(`Caché expirado: ${key}`);
        return null;
      }

      console.log(`Usando datos del caché: ${key}`);
      return JSON.stringify(cacheData.data);
    } catch (error) {
      console.error(`Error al leer caché: ${key}`, error);
      return null;
    }
  }
}

// Exportar una instancia única
const fileCache = new FileCache();
export default fileCache;
