export function searchEntries(entries, province, platform, query) {
 const terms=query.toLowerCase().trim().split(/[\s，,。？?；;]+/).filter(Boolean);
 if(!platform||!terms.length)return [];
 return entries.filter(e=>e.published&&(!province||e.province===province)&&e.platform===platform).map(e=>{
  const text=(e.question+' '+e.keywords+' '+e.answer).toLowerCase();
  const keywords=(e.keywords||'').split(/[\s，,；;]+/).filter(Boolean);
  const score=terms.reduce((sum,t)=>sum+(text.includes(t)?5:0),0)+keywords.filter(k=>query.includes(k)).length*4;
  return {...e,score};
 }).filter(e=>e.score>0).sort((a,b)=>b.score-a.score).slice(0,20);
}
export function splitDocument(text,source) {
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 const result=[];let question='',answer=[];
 const flush=()=>{if(question&&answer.length)result.push({question,answer:answer.join('\n'),keywords:'',source,published:false})};
 for(const line of lines){if(/^(?:问题|问|Q)\s*[:：]/i.test(line)){flush();question=line.replace(/^(?:问题|问|Q)\s*[:：]\s*/i,'');answer=[]}else if(question)answer.push(line.replace(/^(?:答案|答|A)\s*[:：]\s*/i,''))}
 flush();return result;
}
