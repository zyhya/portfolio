// 确保 DATABASE_URL 可用（Vercel Neon 集成注入 DATABASE_URL）
// 同时兼容 POSTGRES_URL 变量名
if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}
