import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../_lib.js';

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name_zh TEXT DEFAULT '韩敬文',
  name_en TEXT DEFAULT 'Jingwen Han',
  title_zh TEXT DEFAULT '全栈开发工程师',
  title_en TEXT DEFAULT 'Full-Stack Developer',
  tagline_zh TEXT DEFAULT '用代码构建优雅的数字体验',
  tagline_en TEXT DEFAULT 'Building elegant digital experiences with code',
  bio_zh TEXT DEFAULT '5年全栈开发经验，专注于 Web 前端与 Node.js 后端。热爱技术，追求极致的用户体验。曾参与多个大型项目的前端架构设计与实现。',
  bio_en TEXT DEFAULT '5 years of full-stack development experience, focusing on Web frontend and Node.js backend. Passionate about technology and pursuing ultimate user experience.',
  email TEXT DEFAULT 'ming.zhang@example.com',
  phone TEXT DEFAULT '+86 138 0000 0000',
  location_zh TEXT DEFAULT '中国 · 深圳',
  location_en TEXT DEFAULT 'Shenzhen, China',
  avatar TEXT DEFAULT '',
  years_exp INT DEFAULT 5,
  projects_count INT DEFAULT 50,
  clients_count INT DEFAULT 30,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title_zh TEXT NOT NULL,
  title_en TEXT,
  desc_zh TEXT,
  desc_en TEXT,
  image TEXT DEFAULT '',
  link TEXT DEFAULT '',
  github TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'web',
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INT DEFAULT 80,
  icon TEXT DEFAULT '',
  category TEXT DEFAULT 'frontend',
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT DEFAULT '#',
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
`.trim();

// POST /api/sync — 需管理员，仅同步表结构（不插入默认数据）
export async function POST(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const statements = CREATE_TABLES
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && /^CREATE TABLE IF NOT EXISTS/i.test(s));

    const results = [];
    for (const stmt of statements) {
      try {
        await sql.query(stmt);
        results.push({ ok: true });
      } catch (e) {
        results.push({ ok: false, error: e.message });
      }
    }

    const allOk = results.every(r => r.ok);
    return jsonResponse({ success: allOk, results });
  } catch (e) {
    return errorResponse('同步表结构失败: ' + e.message, 500);
  }
}
