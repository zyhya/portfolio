import './env.js';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

/**
 * Neon Serverless SQL 客户端
 * 使用 HTTP 协议连接，比 TCP (pg) 更快唤醒休眠的 Neon 免费版数据库
 * fullResults: true 返回 { rows, rowCount, ... } 兼容原 @vercel/postgres 接口
 */
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const neonSql = neon(connectionString, { fullResults: true });

/**
 * 兼容包装器：
 * - 作为 tagged template: sql`SELECT ...` → { rows, rowCount }
 * - sql.query(text): 执行原始 SQL（init.js 使用）
 */
function sql(strings, ...values) {
  return neonSql(strings, ...values);
}

sql.query = async (text) => {
  return neonSql.query(text);
};

/**
 * 从请求 URL 中提取动态路由 ID
 * 兼容 Vercel Node.js Web API 运行时（该运行时不会传入 { params }）
 */
export function getPathId(request) {
  const url = new URL(request.url);
  const segments = url.pathname.split('/').filter(Boolean);
  return segments[segments.length - 1];
}

/**
 * 验证管理员 JWT token
 */
export function verifyAdmin(req) {
  const auth = req.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return false;
  try {
    const secret = process.env.JWT_SECRET || 'portfolio-secret-change-me';
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * 生成管理员 JWT token
 */
export function signToken(payload = {}) {
  const secret = process.env.JWT_SECRET || 'portfolio-secret-change-me';
  return jwt.sign({ role: 'admin', ...payload }, secret, { expiresIn: '7d' });
}

/**
 * 检查管理员登录凭据
 */
export function checkCredentials(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  return username === adminUser && password === adminPass;
}

/**
 * 统一 JSON 响应
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * 错误响应
 */
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

/**
 * 未授权响应
 */
export function unauthorized() {
  return errorResponse('未授权访问', 401);
}

export { sql };
