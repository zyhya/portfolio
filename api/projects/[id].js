import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../../_lib.js';

// PUT /api/projects/[id] — 需管理员
export async function PUT(request, { params }) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = params.id;
    const body = await request.json();
    const { rows } = await sql`
      UPDATE projects SET
        title_zh = ${body.title_zh || ''},
        title_en = ${body.title_en || ''},
        desc_zh = ${body.desc_zh || ''},
        desc_en = ${body.desc_en || ''},
        image = ${body.image || ''},
        video = ${body.video || ''},
        link = ${body.link || ''},
        github = ${body.github || ''},
        tags = ${body.tags || []},
        category = ${body.category || 'illustration'},
        featured = ${body.featured || false},
        sort_order = ${body.sort_order || 0}
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return errorResponse('作品不存在', 404);
    return jsonResponse(rows[0]);
  } catch (e) {
    return errorResponse('更新作品失败: ' + e.message, 500);
  }
}

// DELETE /api/projects/[id] — 需管理员
export async function DELETE(request, { params }) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const id = params.id;
    const { rowCount } = await sql`DELETE FROM projects WHERE id = ${id}`;
    if (rowCount === 0) return errorResponse('作品不存在', 404);
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse('删除作品失败: ' + e.message, 500);
  }
}
