import {IMAGE_QUESTION} from '../server/question.js'
export function chinaDate(value){const n=new Date(value).getTime();return Number.isFinite(n)?new Date(n+8*3600000).toISOString().slice(0,10):''}
export function ticketStats(tickets,{platform=null,start='',end='',status='all',query=''}={}) {
  const needle=query.trim().toLowerCase();
  const filtered=tickets.filter(t=>{
    const date=chinaDate(t.created_at);
    return (platform===null||(t.platform||'')===platform)&&(!start||date>=start)&&(!end||date<=end)&&
      (status==='all'||(status==='resolved'?t.resolved:!t.resolved))&&
      (!needle||(t.question+' '+(t.image_description||'')+' '+(t.answer||'')).toLowerCase().includes(needle));
  });
  const platforms=new Map(),issues=new Map();
  for(const ticket of filtered){
    const platform=ticket.platform||'';
    const question=ticket.question===IMAGE_QUESTION?(ticket.image_description||'图片问题 #'+ticket.id):ticket.question;
    const key=JSON.stringify([platform,question.trim().replace(/\s+/g,' ').toLowerCase()]);
    if(!platforms.has(platform))platforms.set(platform,{platform,total:0,resolved:0,pending:0,latest:'',issues:new Set()});
    if(!issues.has(key))issues.set(key,{key,platform,question,total:0,resolved:0,pending:0,latest:'',tickets:[]});
    const group=issues.get(key),p=platforms.get(platform);
    p.issues.add(key);group.tickets.push(ticket);
    for(const row of [p,group]){row.total++;row[ticket.resolved?'resolved':'pending']++;if(!row.latest||new Date(ticket.created_at)>new Date(row.latest))row.latest=ticket.created_at}
  }
  const ordered=rows=>rows.sort((a,b)=>b.total-a.total||b.pending-a.pending||a.platform.localeCompare(b.platform,'zh-CN'));
  return {tickets:filtered,total:filtered.length,pending:filtered.filter(t=>!t.resolved).length,resolved:filtered.filter(t=>t.resolved).length,
    platforms:ordered([...platforms.values()].map(p=>({...p,issueCount:p.issues.size,issues:undefined}))),issues:ordered([...issues.values()])};
}
export function csvCell(value){let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
