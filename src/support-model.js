import {COMMON_PLATFORM} from './platforms.js'
export function searchEntries(entries, province, platform, query) {
 const terms=query.toLowerCase().trim().split(/[\s，,。？?；;]+/).filter(Boolean);
 if(!terms.length)return [];
 return entries.filter(e=>e.published&&(e.platform===COMMON_PLATFORM||!!platform&&(!province||e.province===province)&&e.platform===platform)).map(e=>{
  const text=(e.question+' '+e.keywords+' '+e.answer).toLowerCase();
  const keywords=(e.keywords||'').split(/[\s，,；;]+/).filter(Boolean);
  const score=terms.reduce((sum,t)=>sum+(text.includes(t)?5:0),0)+keywords.filter(k=>query.includes(k)).length*4;
  return {...e,score};
 }).filter(e=>e.score>0).sort((a,b)=>b.score-a.score).slice(0,20);
}
export function splitDocument(text,source) {
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const result=[];let question='',answer=[];
 const flush=()=>{if(question&&answer.length)result.push({question,answer:answer.join('\n'),keywords:['登录','密码','账号','实名认证','人脸识别','相似度','超时','相机','环境检测','弹窗','准备中','视频','学时','页面过期','空白','黑屏','卡顿','300001','抓拍','活体','H5','PC'].filter(k=>question.includes(k)).join(','),source,published:false})};
 for(const line of lines){if(/^(?:问题|问|Q)\s*[:：]/i.test(line)){flush();question=line.replace(/^(?:问题|问|Q)\s*[:：]\s*/i,'').replace(/^\d+[、.．]\s*/,'');answer=[];const inline=question.match(/^(.+?)(?:通用回复|答案)\s*[:：]\s*(.+)$/);if(inline){question=inline[1];answer=[inline[2]]}}else if(question)answer.push(line.replace(/^(?:答案|答|A)\s*[:：]\s*/i,''))}
 flush();return result;
}

export function wordHtmlToQuestionText(html) {
 const document=new DOMParser().parseFromString(html,'text/html');
 const headings=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')];
 const counts=new Map();for(const h of headings)counts.set(h.tagName,(counts.get(h.tagName)||0)+1);
 const questionTag=[...counts].filter(([,n])=>n>=2).sort((a,b)=>b[1]-a[1]||b[0].localeCompare(a[0]))[0]?.[0];
 const lines=[];
 for(const element of document.body.children){
  if(element.tagName===questionTag){lines.push('问题：'+element.textContent.trim());continue}
  if(/^H[1-6]$/.test(element.tagName)){if(!questionTag)lines.push(element.textContent.trim());continue}
  if(element.matches('ol,ul')){for(const li of element.querySelectorAll('li')){const own=[...li.childNodes].filter(n=>!(n.nodeType===1&&n.matches('ol,ul'))).map(n=>n.textContent).join(' ').trim();if(own)lines.push(own)}}
  else lines.push(element.textContent.trim());
 }
 return lines.filter(Boolean).join('\n\n');
}
