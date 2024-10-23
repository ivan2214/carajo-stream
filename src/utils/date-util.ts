import { parseISO, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Función que retorna un string con el tiempo transcurrido desde una fecha dada.
 * @param {string} publishedAt - La fecha en formato ISO.
 * @returns {string} - String en formato "hace X tiempo".
 */
export const timeAgo = (publishedAt: string): string => {
	const parsedDate = parseISO(publishedAt);
	return formatDistanceToNow(parsedDate, { addSuffix: true, locale: es });
};
