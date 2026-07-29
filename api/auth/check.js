import { verifyAdmin, jsonResponse } from '../_lib.js';

export async function GET(request) {
  const isAdmin = verifyAdmin(request);
  return jsonResponse({ authenticated: isAdmin });
}
