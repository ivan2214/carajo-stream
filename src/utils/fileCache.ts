import fs from "node:fs";
import path from "node:path";

// Determinar la ruta base para el directorio de caché
let BASE_DIR = "";
try {
  // En entorno de producción (Vercel/Netlify/etc)
  if (process.env.LAMBDA_TASK_ROOT || process.env.VERCEL) {
    // Usar un directorio temporal que sea escribible
    BASE_DIR = process.env.TEMP || process.env.TMP || "/tmp";
  } else {
    // En desarrollo local, usar el directorio del proyecto
    BASE_DIR = process.cwd();
  }
} catch (error) {
  // Si hay algún error, usar /tmp como fallback
  console.error("Error al determinar directorio base:", error);
  BASE_DIR = "/tmp";
}

// Directorio donde se almacenarán los archivos de caché
const CACHE_DIR = path.join(BASE_DIR, "cache");

// Función para asegurar que el directorio existe
function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error(`Error al crear directorio de caché: ${CACHE_DIR}`, error);
    return false;
  }
}

interface CacheData {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  data: any;
  expiry: number; // Timestamp de expiración
}

class FileCache {
  /**
   * Verifica si el sistema de caché está disponible
   * @returns true si el sistema de caché está disponible, false en caso contrario
   */
  isCacheAvailable(): boolean {
    return ensureCacheDir();
  }

  /**
   * Guarda datos en el caché con un tiempo de expiración
   * @param key Clave para identificar los datos
   * @param data Datos a guardar
   * @param ttl Tiempo de vida en segundos
   */
  async setEx(key: string, ttl: number, data: string): Promise<void> {
    // Verificar que el directorio de caché exista antes de escribir
    if (!ensureCacheDir()) {
      console.error(
        `No se pudo guardar en caché: ${key} - directorio no disponible`
      );
      return;
    }

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
    // Verificar que el directorio de caché exista
    if (!ensureCacheDir()) {
      console.log(
        `No se pudo acceder al caché: ${key} - directorio no disponible`
      );
      return null;
    }

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
        try {
          await fs.promises.unlink(cacheFilePath);
          console.log(`Caché expirado: ${key}`);
        } catch (unlinkError) {
          console.error(
            `Error al eliminar caché expirado: ${key}`,
            unlinkError
          );
        }
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
