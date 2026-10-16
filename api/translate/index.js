import crypto from 'node:crypto';
import { jsonResponse, errorResponse } from '../_lib.js';

// 百度翻译 API 签名：MD5(appid + q + salt + key)
function makeSign(appid, q, salt, key) {
  const raw = appid + q + salt + key;
  return crypto.createHash('md5').update(raw, 'utf8').digest('hex');
}

// POST /api/translate
// body: { text: string, from?: 'zh', to?: 'en' }
// 返回: { translated: string, raw?: any }
export async function POST(request) {
  try {
    const body = await request.json();
    const text = (body?.text || '').toString().trim();
    const from = body?.from || 'zh';
    const to = body?.to || 'en';

    if (!text) return errorResponse('缺少待翻译文本', 400);

    const appid = process.env.BAIDU_TRANSLATE_APPID;
    const key = process.env.BAIDU_TRANSLATE_KEY;

    // 未配置百度翻译 key 时，返回明确的错误提示
    if (!appid || !key) {
      return errorResponse('未配置百度翻译 API（BAIDU_TRANSLATE_APPID / BAIDU_TRANSLATE_KEY）', 503);
    }

    const salt = crypto.randomBytes(8).toString('hex');
    const sign = makeSign(appid, text, salt, key);

    const params = new URLSearchParams({ q: text, from, to, appid, salt, sign });
    const url = `https://fanyi.baidu.com/api/trans/vip/translate?${params.toString()}`;

    const resp = await fetch(url);
    const data = await resp.json();

    if (data.error_code) {
      return errorResponse(`百度翻译错误 ${data.error_code}: ${data.error_msg || ''}`, 502);
    }

    const translated = Array.isArray(data.trans_result)
      ? data.trans_result.map(r => r.dst).join('\n')
      : '';

    return jsonResponse({ translated, raw: data });
  } catch (e) {
    return errorResponse('翻译失败: ' + e.message, 500);
  }
}
