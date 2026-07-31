import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../_lib.js';

// GET /api/profile — 公开
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM profile ORDER BY id ASC LIMIT 1`;
    return jsonResponse(rows[0] || {});
  } catch (e) {
    return errorResponse('获取个人信息失败: ' + e.message, 500);
  }
}

// PUT /api/profile — 需管理员
export async function PUT(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const body = await request.json();
    // social_links 接收数组或字符串，统一存为 JSON 字符串
    let socialLinks = body.social_links;
    if (Array.isArray(socialLinks)) socialLinks = JSON.stringify(socialLinks);
    if (typeof socialLinks !== 'string') socialLinks = '[]';

    const { rows } = await sql`
      UPDATE profile SET
        name_zh = ${body.name_zh || ''},
        name_en = ${body.name_en || ''},
        title_zh = ${body.title_zh || ''},
        title_en = ${body.title_en || ''},
        tagline_zh = ${body.tagline_zh || ''},
        tagline_en = ${body.tagline_en || ''},
        bio_zh = ${body.bio_zh || ''},
        bio_en = ${body.bio_en || ''},
        email = ${body.email || ''},
        phone = ${body.phone || ''},
        location_zh = ${body.location_zh || ''},
        location_en = ${body.location_en || ''},
        avatar = ${body.avatar || ''},
        years_exp = ${body.years_exp || 0},
        projects_count = ${body.projects_count || 0},
        clients_count = ${body.clients_count || 0},
        social_links = ${socialLinks},
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `;
    if (rows.length === 0) return errorResponse('个人信息记录不存在', 404);
    return jsonResponse(rows[0]);
  } catch (e) {
    return errorResponse('更新个人信息失败: ' + e.message, 500);
  }
}
