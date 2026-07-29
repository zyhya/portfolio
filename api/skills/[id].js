import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../../_lib.js';

// PUT /api/skills/[id] — 需管理员
export async function PUT(request, { params }) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = params.id;
    const body = await request.json();
    const { rows } = await sql`
      UPDATE skills SET
        name = ${body.name || ''},
        level = ${body.level || 80},
        icon = ${body.icon || ''},
        category = ${body.category || 'frontend'},
        sort_order = ${body.sort_order || 0}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return errorResponse('技能不存在', 404);
    return jsonResponse(rows[0]);
  } catch (e) {
    return errorResponse('更新技能失败: ' + e.message, 500);
  }
}

// DELETE /api/skills/[id] — 需管理员
export async function DELETE(request, { params }) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = params.id;
    const { rowCount } = await sql`DELETE FROM skills WHERE id = ${id}`;
    if (rowCount === 0) return errorResponse('技能不存在', 404);
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse('删除技能失败: ' + e.message, 500);
  }
}
