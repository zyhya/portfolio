import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../../_lib.js';

// PUT /api/social/[id] — 需管理员
export async function PUT(request, { params }) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = params.id;
    const body = await request.json();
    const { rows } = await sql`
      UPDATE social_links SET
        name = ${body.name || ''},
        url = ${body.url || '#'},
        icon = ${body.icon || ''},
        sort_order = ${body.sort_order || 0}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return errorResponse('社交链接不存在', 404);
    return jsonResponse(rows[0]);
  } catch (e) {
    return errorResponse('更新社交链接失败: ' + e.message, 500);
  }
}

// DELETE /api/social/[id] — 需管理员
export async function DELETE(request, { params }) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = params.id;
    const { rowCount } = await sql`DELETE FROM social_links WHERE id = ${id}`;
    if (rowCount === 0) return errorResponse('社交链接不存在', 404);
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse('删除社交链接失败: ' + e.message, 500);
  }
}
