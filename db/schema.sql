-- ============================================
-- Portfolio Database Schema (Vercel Postgres)
-- ============================================

-- 个人信息表（单行）
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

-- 作品项目表
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

-- 技能表
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INT DEFAULT 80,
  icon TEXT DEFAULT '',
  category TEXT DEFAULT 'frontend',
  sort_order INT DEFAULT 0
);

-- 社交链接表
CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT DEFAULT '#',
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

-- 联系留言表
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  ip TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 默认数据
-- ============================================

INSERT INTO profile (name_zh, name_en, title_zh, title_en, tagline_zh, tagline_en, bio_zh, bio_en, email, phone, location_zh, location_en, years_exp, projects_count, clients_count)
SELECT '韩敬文', 'Jingwen Han', '全栈开发工程师', 'Full-Stack Developer', '用代码构建优雅的数字体验', 'Building elegant digital experiences with code', '5年全栈开发经验，专注于 Web 前端与 Node.js 后端。热爱技术，追求极致的用户体验。', '5 years of full-stack development experience, focusing on Web frontend and Node.js backend.', 'ming.zhang@example.com', '+86 138 0000 0000', '中国 · 深圳', 'Shenzhen, China', 5, 50, 30
WHERE NOT EXISTS (SELECT 1 FROM profile);

INSERT INTO projects (title_zh, title_en, desc_zh, desc_en, image, link, github, tags, category, featured, sort_order) VALUES
('霓虹商城', 'Neon Shop', '基于 Vue 3 的电商前端，霓虹风格 UI', 'Vue 3 e-commerce frontend with neon UI', '', '#', '#', ARRAY['Vue 3','Tailwind CSS','Vite'], 'web', TRUE, 1),
('数据可视化面板', 'Data Dashboard', '实时数据可视化，支持多种图表类型', 'Real-time data visualization with multiple chart types', '', '#', '#', ARRAY['React','D3.js','WebSocket'], 'web', TRUE, 2),
('AI 写作助手', 'AI Writing Assistant', '基于大语言模型的智能写作工具', 'AI-powered writing tool based on LLM', '', '#', '#', ARRAY['Next.js','OpenAI','PostgreSQL'], 'app', TRUE, 3),
('贪吃蛇小游戏', 'Snake Game', '霓虹风格贪吃蛇，支持键盘和触控', 'Neon-style snake game with keyboard and touch support', '', '#', '#', ARRAY['JavaScript','Canvas','Web Audio'], 'game', FALSE, 4)
ON CONFLICT DO NOTHING;

INSERT INTO skills (name, level, icon, category, sort_order) VALUES
('Vue.js', 95, '', 'frontend', 1),
('React', 90, '', 'frontend', 2),
('TypeScript', 88, '', 'frontend', 3),
('Node.js', 85, '', 'backend', 1),
('Python', 80, '', 'backend', 2),
('PostgreSQL', 78, '', 'backend', 3),
('Docker', 75, '', 'devops', 1),
('AWS', 70, '', 'devops', 2)
ON CONFLICT DO NOTHING;

INSERT INTO social_links (name, url, icon, sort_order) VALUES
('GitHub', 'https://github.com', '🐙', 1),
('LinkedIn', 'https://linkedin.com', '💼', 2),
('Twitter', 'https://twitter.com', '🐦', 3),
('Email', 'mailto:ming.zhang@example.com', '📧', 4)
ON CONFLICT DO NOTHING;
