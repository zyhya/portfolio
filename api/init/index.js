import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../_lib.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name_zh TEXT DEFAULT '韩敬文',
  name_en TEXT DEFAULT 'Jingwen Han',
  title_zh TEXT DEFAULT '插画师',
  title_en TEXT DEFAULT 'Illustrator',
  tagline_zh TEXT DEFAULT '用画笔描绘世界，用色彩讲述故事',
  tagline_en TEXT DEFAULT 'Painting worlds with brushstrokes, telling stories with colors',
  bio_zh TEXT DEFAULT '5年插画创作经验，专注于角色设计与场景插画。热爱艺术，追求独特的视觉表达。曾为多个品牌、出版物及游戏项目创作插画。',
  bio_en TEXT DEFAULT '5 years of illustration experience, specializing in character design and scene illustration. Passionate about art and pursuing unique visual expression.',
  email TEXT DEFAULT 'contact@example.com',
  phone TEXT DEFAULT '+86 138 0000 0000',
  location_zh TEXT DEFAULT '中国 · 北京',
  location_en TEXT DEFAULT 'Beijing, China',
  avatar TEXT DEFAULT '',
  years_exp INT DEFAULT 5,
  projects_count INT DEFAULT 200,
  clients_count INT DEFAULT 50,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title_zh TEXT NOT NULL,
  title_en TEXT,
  desc_zh TEXT,
  desc_en TEXT,
  image TEXT DEFAULT '',
  video TEXT DEFAULT '',
  link TEXT DEFAULT '',
  github TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'illustration',
  featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INT DEFAULT 80,
  icon TEXT DEFAULT '',
  category TEXT DEFAULT 'illustration',
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

const DEFAULT_DATA = `
INSERT INTO profile (name_zh, name_en, title_zh, title_en, tagline_zh, tagline_en, bio_zh, bio_en, email, phone, location_zh, location_en, years_exp, projects_count, clients_count)
SELECT '韩敬文', 'Jingwen Han', '插画师', 'Illustrator', '用画笔描绘世界，用色彩讲述故事', 'Painting worlds with brushstrokes, telling stories with colors', '5年插画创作经验，专注于角色设计与场景插画。热爱艺术，追求独特的视觉表达。', '5 years of illustration experience, specializing in character design and scene illustration.', 'contact@example.com', '+86 138 0000 0000', '中国 · 北京', 'Beijing, China', 5, 200, 50
WHERE NOT EXISTS (SELECT 1 FROM profile);

INSERT INTO projects (title_zh, title_en, desc_zh, desc_en, image, video, link, github, tags, category, featured, sort_order) VALUES
('春日少女', 'Spring Girl', '原创角色设计，春日主题，柔和色调搭配细腻光影', 'Original character design with spring theme', '', '', '#', '#', ARRAY['Procreate','角色设计','数字绘画'], 'character', TRUE, 1),
('星空之城', 'City of Stars', '奇幻场景插画，星空下的城市，梦幻氛围', 'Fantasy scene illustration, city under starry sky', '', '', '#', '#', ARRAY['Photoshop','场景插画','概念艺术'], 'scene', TRUE, 2),
('童话说书人', 'Storyteller', '儿童绘本插画系列，温暖的水彩风格', 'Children picture book illustration series, warm watercolor style', '', '', '#', '#', ARRAY['水彩','手绘','儿童插画'], 'illustration', TRUE, 3),
('品牌IP形象', 'Brand Mascot', '商业IP角色设计，从概念到完整视觉系统', 'Commercial IP character design, from concept to complete visual system', '', '', '#', '#', ARRAY['Illustrator','角色设计','品牌设计'], 'commercial', FALSE, 4)
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, level, icon, category, sort_order) VALUES
('角色设计', 95, '', 'illustration', 1),
('场景插画', 92, '', 'illustration', 2),
('概念艺术', 88, '', 'illustration', 3),
('Procreate', 95, '', 'digital', 1),
('Photoshop', 90, '', 'digital', 2),
('Clip Studio Paint', 88, '', 'digital', 3),
('水彩', 85, '', 'traditional', 1),
('彩铅', 82, '', 'traditional', 2),
('After Effects', 75, '', 'animation', 1),
('Blender 3D', 70, '', 'animation', 2)
ON CONFLICT DO NOTHING;

INSERT INTO social_links (name, url, icon, sort_order) VALUES
('Behance', 'https://behance.net', '🎨', 1),
('ArtStation', 'https://artstation.com', '🖼️', 2),
('Instagram', 'https://instagram.com', '📸', 3),
('Weibo', 'https://weibo.com', '📱', 4)
ON CONFLICT DO NOTHING;
`.trim();

function splitStatements(sqlText) {
  return sqlText
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
}

// POST /api/init — 需管理员，执行 schema 初始化数据库
// 如果 body 包含 syncOnly: true，则只同步表结构（不插入默认数据）
export async function POST(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    let syncOnly = false;
    try { const body = await request.json(); syncOnly = body?.syncOnly === true; } catch {}

    const schemaStatements = splitStatements(SCHEMA);
    const results = [];

    for (const stmt of schemaStatements) {
      try {
        await sql.query(stmt);
        results.push({ ok: true });
      } catch (e) {
        results.push({ ok: false, error: e.message });
      }
    }

    // 尝试添加 video 字段（兼容已有表）
    try {
      await sql.query('ALTER TABLE projects ADD COLUMN IF NOT EXISTS video TEXT DEFAULT \'\'');
      results.push({ ok: true, note: 'video column ensured' });
    } catch (e) {
      results.push({ ok: false, error: e.message });
    }

    if (!syncOnly) {
      const dataStatements = splitStatements(DEFAULT_DATA);
      for (const stmt of dataStatements) {
        try {
          await sql.query(stmt);
          results.push({ ok: true });
        } catch (e) {
          results.push({ ok: false, error: e.message });
        }
      }
    }

    const allOk = results.every(r => r.ok);
    return jsonResponse({ success: allOk, results });
  } catch (e) {
    return errorResponse('初始化失败: ' + e.message, 500);
  }
}
