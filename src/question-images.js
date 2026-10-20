export async function prepareImage(file) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('仅支持 JPG、PNG、WebP 图片');
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error('原图不能超过 10 MB，请裁剪后上传');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > 40000000) throw new Error('图片尺寸过大，请裁剪后上传');
    let scale = Math.min(1,1600 / Math.max(img.naturalWidth,img.naturalHeight));
    const canvas = document.createElement('canvas');
    for (let attempt=0;attempt<5;attempt++) {
      canvas.width = Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height = Math.max(1,Math.round(img.naturalHeight*scale));
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0,0,canvas.width,canvas.height);
      context.drawImage(img,0,0,canvas.width,canvas.height);
      const blob = await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.85-attempt*0.07));
      if (blob && blob.size<=300*1024) {
        const data = await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('图片读取失败'));reader.readAsDataURL(blob)});
        return {name:file.name.slice(0,200)||'粘贴截图.jpg',data};
      }
      scale *= 0.8;
    }
    throw new Error('图片压缩后仍过大，请裁剪后重试');
  } catch(error) {
    throw new Error(error.name==='EncodingError'?'无法读取图片，请换一张图片':error.message);
  } finally {URL.revokeObjectURL(url)}
}
