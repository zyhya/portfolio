import { sql, verifyAdmin, getPathId, jsonResponse, errorResponse, unauthorized } from '../../_lib.js';

// PATCH /api/contact/[id] — 需管理员，标记已读
export async function PATCH(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = getPathId(request);
    const { rows } = await sql`
      UPDATE contact_messages SET read = TRUE WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return errorResponse('留言不存在', 404);
    return jsonResponse({ success: true, message: rows[0] });
  } catch (e) {
    return errorResponse('标记已读失败: ' + e.message, 500);
  }
}

// DELETE /api/contact/[id] — 需管理员
export async function DELETE(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = getPathId(request);
    const { rowCount } = await sql`DELETE FROM contact_messages WHERE id = ${id}`;
    if (rowCount === 0) return errorResponse('留言不存在', 404);
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse('删除留言失败: ' + e.message, 500);
  }
}
