export const formattedDate = (value: Date | string): string => {
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return date.toLocaleDateString('ru-Ru', { weekday: 'short' });
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
};