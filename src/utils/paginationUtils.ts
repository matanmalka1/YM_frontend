export const getTotalPages = (total: number, pageSize: number) => Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
