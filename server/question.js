export const MAX_IMAGES = 3;
export const MAX_IMAGE_BYTES = 300 * 1024;
export const IMAGE_QUESTION = '图片问题（请管理员补充问题描述）';

export function parseQuestion(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('请求格式错误');
  const question = body.question ?? '';
  const platform = body.platform ?? '';
  if (typeof question !== 'string' || question.length > 2000 || typeof platform !== 'string' || platform.length > 1000) throw new Error('问题最多 2000 字，请检查平台和问题');
  const images = body.images ?? [];
  if (!Array.isArray(images) || images.length > MAX_IMAGES) throw new Error('每次最多上传 3 张图片');
  const attachments = images.map(image => {
    if (!image || typeof image.name !== 'string' || image.name.length > 200 || typeof image.data !== 'string' || image.data.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 + 50) throw new Error('图片格式或大小无效，请重新选择');
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image.data);
    if (!match) throw new Error('仅支持 JPG、PNG、WebP 图片');
    const bytes = Buffer.from(match[2], 'base64');
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES || bytes.toString('base64') !== match[2]) throw new Error('图片过大或编码无效，请重新选择');
    const type = match[1];
    const valid = type === 'jpeg' ? bytes.subarray(0,3).equals(Buffer.from([255,216,255]))
      : type === 'png' ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : bytes.toString('ascii',0,4) === 'RIFF' && bytes.toString('ascii',8,12) === 'WEBP';
    if (!valid) throw new Error('图片内容与格式不符，请重新选择');
    return {name:image.name.trim() || '问题截图',mime:'image/'+type,data:match[2]};
  });
  if (!question.trim() && !attachments.length) throw new Error('请输入学员问题或上传图片');
  return {platform:platform.trim(),question:question.trim() || IMAGE_QUESTION,images:attachments};
}
