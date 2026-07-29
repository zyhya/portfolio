import { checkCredentials, signToken, jsonResponse, errorResponse } from '../_lib.js';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return errorResponse('请输入用户名和密码', 400);
    }
    if (!checkCredentials(username, password)) {
      return errorResponse('用户名或密码错误', 401);
    }
    const token = signToken({ username });
    return jsonResponse({ token, username });
  } catch (e) {
    return errorResponse('登录失败: ' + e.message, 500);
  }
}
