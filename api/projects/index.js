import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../_lib.js';

// GET /api/projects — 公开，返回所有作品
export async function GET() {
  try {
    const { rows } = await sql`
      SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC
    `;
    return jsonResponse(rows);
  } catch (e) {
    return errorResponse('获取作品失败: ' + e.message, 500);
  }
}

// POST /api/projects — 需管理员
export async function POST(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const body = await request.json();
    const { rows } = await sql`
      INSERT INTO projects (title_zh, title_en, desc_zh, desc_en, image, video, link, github, tags, category, featured, sort_order)
      VALUES (${body.title_zh || ''}, ${body.title_en || ''}, ${body.desc_zh || ''}, ${body.desc_en || ''},
              ${body.image || ''}, ${body.video || ''}, ${body.link || ''}, ${body.github || ''},
              ${body.tags || []}, ${body.category || 'illustration'}, ${body.featured || false}, ${body.sort_order || 0})
      RETURNING *
    `;
    return jsonResponse(rows[0], 201);
  } catch (e) {
    return errorResponse('创建作品失败: ' + e.message, 500);
  }
}
