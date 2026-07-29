import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../_lib.js';

// GET /api/skills — 公开
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM skills ORDER BY sort_order ASC`;
    return jsonResponse(rows);
  } catch (e) {
    return errorResponse('获取技能失败: ' + e.message, 500);
  }
}

// POST /api/skills — 需管理员
export async function POST(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const body = await request.json();
    const { rows } = await sql`
      INSERT INTO skills (name, level, icon, category, sort_order)
      VALUES (${body.name || ''}, ${body.level || 80}, ${body.icon || ''}, ${body.category || 'frontend'}, ${body.sort_order || 0})
      RETURNING *
    `;
    return jsonResponse(rows[0], 201);
  } catch (e) {
    return errorResponse('创建技能失败: ' + e.message, 500);
  }
}
