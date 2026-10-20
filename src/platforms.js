export const COMMON_PLATFORM = '通用';
export const platformLabel = name => name === COMMON_PLATFORM ? '通用知识（所有平台）' : name || '未指定平台';
export function validPlatform(p) {
  return !!p && typeof p.name==='string' && !!p.name.trim() && p.name.trim().length<=200 &&
    (p.notes===undefined || typeof p.notes==='string' && p.notes.length<=1000) &&
    typeof p.active==='boolean' && (p.id===undefined || Number.isInteger(p.id)&&p.id>0);
}
