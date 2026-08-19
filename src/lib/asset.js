/**
 * Путь к файлу из public/ с учётом базового пути сайта.
 * На GitHub Pages сайт живёт в /rudolf/, локально в /: Vite подставляет BASE_URL.
 */
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\/+/, '')}`;
