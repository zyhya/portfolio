import { handleUpload } from '@vercel/blob/client';
import { verifyAdmin, unauthorized, jsonResponse } from '../_lib.js';

// POST /api/blob — 仅管理员可用，为前端直传生成 Vercel Blob 上传授权
export async function POST(request) {
  if (!verifyAdmin(request)) return unauthorized();
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: '请求体不是合法的 JSON' }, 400);
  }
  try {
    const result = await handleUpload({
      request,
      body,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // 可选：在前端请求时携带的 payload 上做校验，这里放开
      onBeforeGenerateToken: (pathname, clientPayload) => {
        return { tokenPayload: clientPayload };
      },
    });
    return Response.json(result);
  } catch (e) {
    return jsonResponse({ error: e.message || '生成上传授权失败' }, 400);
  }
}
