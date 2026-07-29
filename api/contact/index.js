import { sql, verifyAdmin, jsonResponse, errorResponse, unauthorized } from '../_lib.js';

// GET /api/contact — 需管理员，返回留言列表
export async function GET(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const { rows } = await sql`
      SELECT * FROM contact_messages ORDER BY created_at DESC
    `;
    return jsonResponse(rows);
  } catch (e) {
    // 表不存在时返回空数组，避免首次进入后台报错
    if (e.message && e.message.includes('contact_messages')) {
      return jsonResponse([]);
    }
    return errorResponse('获取留言失败: ' + e.message, 500);
  }
}

// PATCH /api/contact — 需管理员，全部标记已读
export async function PATCH(request) {
  if (!verifyAdmin(request)) return unauthorized();
  try {
    const { rowCount } = await sql`
      UPDATE contact_messages SET read = TRUE WHERE read = FALSE
    `;
    return jsonResponse({ success: true, updated: rowCount });
  } catch (e) {
    return errorResponse('全部标记已读失败: ' + e.message, 500);
  }
}

// POST /api/contact — 公开，保存留言
export async function POST(request) {
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    const email = (body.email || '').trim();
    const message = (body.message || '').trim();

    if (!name) return errorResponse('请输入姓名', 400);
    if (!email) return errorResponse('请输入邮箱', 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse('邮箱格式不正确', 400);
    }
    if (!message) return errorResponse('请输入留言内容', 400);
    if (message.length > 2000) return errorResponse('留言内容过长，请限制在 2000 字以内', 400);

    // 获取用户 IP（如可用）
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               '';

    const { rows } = await sql`
      INSERT INTO contact_messages (name, email, message, ip)
      VALUES (${name}, ${email}, ${message}, ${ip.split(',')[0].trim()})
      RETURNING *
    `;
    return jsonResponse({ success: true, message: rows[0] }, 201);
  } catch (e) {
    return errorResponse('保存留言失败: ' + e.message, 500);
  }
}
