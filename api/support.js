import {modelConfig} from '../server/model-provider.js';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { generateAnswer } from '../server/ai.js';
import { recognizeImages } from '../server/vision.js';
import { COMMON_PLATFORM,validPlatform } from '../src/platforms.js';
import { parseQuestion, IMAGE_QUESTION } from '../server/question.js';
import { parsePublishIds } from '../src/knowledge-management.js';
import { searchEntries } from '../src/support-model.js';
import {parseTicketFeedback,saveTicketFeedback} from '../server/ticket-feedback.js';
import {parseTicketDeleteId,deleteTicket} from '../server/ticket-management.js';

let ready;
function database() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_NOT_CONFIGURED');
  return neon(url);
}
async function init(sql) {
  if (!ready) ready = (async () => {
    await sql`CREATE TABLE IF NOT EXISTS support_users (username TEXT PRIMARY KEY, password TEXT NOT NULL, active BOOLEAN NOT NULL DEFAULT TRUE)`;
    await sql`ALTER TABLE support_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'staff'`;
    await sql`ALTER TABLE support_users ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1`;
    await sql`CREATE TABLE IF NOT EXISTS support_entries (id SERIAL PRIMARY KEY, province TEXT NOT NULL, platform TEXT NOT NULL, question TEXT NOT NULL, answer TEXT NOT NULL, keywords TEXT NOT NULL DEFAULT '', source TEXT NOT NULL DEFAULT '', published BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS support_tickets (id SERIAL PRIMARY KEY, province TEXT NOT NULL, platform TEXT NOT NULL, question TEXT NOT NULL, author TEXT NOT NULL, resolved BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`CREATE TABLE IF NOT EXISTS support_ticket_images (id SERIAL PRIMARY KEY, ticket_id INT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE, name TEXT NOT NULL, mime TEXT NOT NULL, data TEXT NOT NULL)`;
    await sql`CREATE INDEX IF NOT EXISTS support_ticket_images_ticket_idx ON support_ticket_images(ticket_id)`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS image_description TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS answer TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS feedback_resolved BOOLEAN`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS feedback_at TIMESTAMPTZ`;
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS feedback_by TEXT`;
    await sql`ALTER TABLE support_entries ADD COLUMN IF NOT EXISTS ticket_id INT UNIQUE`;
    await sql`CREATE TABLE IF NOT EXISTS support_platforms (id SERIAL PRIMARY KEY,name TEXT NOT NULL UNIQUE,notes TEXT NOT NULL DEFAULT '',active BOOLEAN NOT NULL DEFAULT TRUE,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await sql`INSERT INTO support_platforms(name,notes) VALUES(${COMMON_PLATFORM},'适用于所有平台的通用知识') ON CONFLICT(name) DO NOTHING`;
    await sql`INSERT INTO support_platforms(name) SELECT DISTINCT platform FROM (SELECT platform FROM support_entries UNION SELECT platform FROM support_tickets) p WHERE platform<>'' ON CONFLICT(name) DO NOTHING`;
    await sql`CREATE TABLE IF NOT EXISTS support_ai_usage (username TEXT PRIMARY KEY, started TIMESTAMPTZ NOT NULL DEFAULT NOW(), calls INT NOT NULL DEFAULT 0)`;
    await sql`CREATE TABLE IF NOT EXISTS support_attempts (username TEXT PRIMARY KEY, failures INT NOT NULL, started TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  })().catch(e => { ready = null; throw e; });
  await ready;
}
const response = (data, status=200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export function validPassword(value){return typeof value==='string'&&value.length>=12&&value.length<=256;}
export function hashPassword(value, salt=randomBytes(16).toString('hex')) {return salt+':'+scryptSync(value,salt,64).toString('hex');}
function equal(a,b) {const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function validEntry(e) {return e && ['platform','question','answer'].every(k=>typeof e[k]==='string'&&e[k].trim()&&e[k].length<=(k==='answer'?30000:1000))&&(!e.keywords||typeof e.keywords==='string'&&e.keywords.length<=2000)&&(!e.source||typeof e.source==='string'&&e.source.length<=1000);}
async function saveQuestion(sql,username,{platform,question,images}) {
  const tickets=await sql`WITH ticket AS (
    INSERT INTO support_tickets(province,platform,question,author) VALUES('',${platform},${question},${username}) RETURNING id
  ), attachments AS (
    INSERT INTO support_ticket_images(ticket_id,name,mime,data)
    SELECT ticket.id,image->>'name',image->>'mime',image->>'data' FROM ticket CROSS JOIN jsonb_array_elements(${JSON.stringify(images)}::jsonb) AS image RETURNING id
  ) SELECT ticket.id,(SELECT COUNT(*) FROM attachments) AS image_count FROM ticket`;
  return tickets[0].id;
}
export async function handler(request) {
 try {
  const secret=process.env.JWT_SECRET;
  if (!secret || secret.length<32 || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return response({error:'请先在部署后台配置管理员账号、密码和至少 32 位的 JWT_SECRET'},503);
  const sql=database();await init(sql);
  const action=new URL(request.url).searchParams.get('action')||'entries';
  const write=request.method==='POST';
  if(write){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'请求来源无效'},403)}
  if(!['GET','POST'].includes(request.method))return response({error:'不支持此请求'},405);
  let body={};if(write){const text=await request.text();if(text.length>1500000)return response({error:'提交内容过大，请减少图片或分批导入'},413);try{body=JSON.parse(text)}catch{return response({error:'请求格式错误'},400)}}
  if(action==='login'&&write){
    const {username,password}=body;
    if(typeof username!=='string'||username.length>100||typeof password!=='string'||password.length>256)return response({error:'请输入有效账号和密码'},400);
    const attempts=await sql`SELECT * FROM support_attempts WHERE username=${username}`;
    if(attempts[0]?.failures>=8&&Date.now()-new Date(attempts[0].started).getTime()<900000)return response({error:'尝试过多，请 15 分钟后再试'},429);
    let role='staff',ok=false,version=0;
    const accounts=await sql`SELECT password,role,version,active FROM support_users WHERE username=${username}`;
    if(accounts[0]){const a=accounts[0];ok=a.active&&equal(hashPassword(password,a.password.split(':')[0]),a.password);role=username===process.env.ADMIN_USERNAME?'admin':a.role;version=a.version}
    else if(username===process.env.ADMIN_USERNAME){role='admin';ok=equal(password,process.env.ADMIN_PASSWORD)}
    if(!ok){await sql`INSERT INTO support_attempts (username,failures) VALUES (${username},1) ON CONFLICT(username) DO UPDATE SET failures=CASE WHEN support_attempts.started<NOW()-INTERVAL '15 minutes' THEN 1 ELSE support_attempts.failures+1 END, started=CASE WHEN support_attempts.started<NOW()-INTERVAL '15 minutes' THEN NOW() ELSE support_attempts.started END`;return response({error:'账号或密码错误'},401)}
    await sql`DELETE FROM support_attempts WHERE username=${username}`;
    if(body.adminLogin&&role!=='admin')return response({error:'此入口仅限管理员，请使用客服端登录'},403);
    const token=jwt.sign({username,role,version,aud:'support'},secret,{expiresIn:'8h'});
    const result=response({user:{username,role}});result.headers.set('Set-Cookie',`support_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);return result;
  }
  let user;try{const token=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('support_session='))?.slice(16);user=jwt.verify(token,secret,{audience:'support',algorithms:['HS256']})}catch{return response({error:'请登录'},401)}
  const accountRows=await sql`SELECT active,role,version,password FROM support_users WHERE username=${user.username}`;
  const currentAccount=accountRows[0];
  if(currentAccount){if(!currentAccount.active||currentAccount.version!==user.version)return response({error:'登录已失效，请重新登录'},401);user.role=user.username===process.env.ADMIN_USERNAME?'admin':currentAccount.role}
  else if(user.username!==process.env.ADMIN_USERNAME||user.version!==0)return response({error:'登录已失效，请重新登录'},401);
  if(write){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'请求来源无效'},403)}
  if(action==='me')return response({user:{username:user.username,role:user.role}});
  if(action==='logout'){const r=response({ok:true});r.headers.set('Set-Cookie','support_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');return r}
  if(action==='password'&&write){
    const target=body.username;
    if(typeof target!=='string'||!target.trim())return response({error:'账号无效'},400);
    const own=target===user.username;
    if(!own&&(user.role!=='admin'||target===process.env.ADMIN_USERNAME))return response({error:'无权重置此账号密码'},403);
    if(!validPassword(body.password)||body.password!==body.confirmPassword)return response({error:'新密码需 12 至 256 位，且两次输入一致'},400);
    if(own){
      if(typeof body.currentPassword!=='string'||body.currentPassword.length>256)return response({error:'请输入当前密码'},400);
      const attempts=await sql`SELECT * FROM support_attempts WHERE username=${'change:'+target}`;
      if(attempts[0]?.failures>=8&&Date.now()-new Date(attempts[0].started).getTime()<900000)return response({error:'尝试过多，请 15 分钟后再试'},429);
      const ok=currentAccount?equal(hashPassword(body.currentPassword,currentAccount.password.split(':')[0]),currentAccount.password):equal(body.currentPassword,process.env.ADMIN_PASSWORD);
      if(!ok){await sql`INSERT INTO support_attempts(username,failures) VALUES(${'change:'+target},1) ON CONFLICT(username) DO UPDATE SET failures=CASE WHEN support_attempts.started<NOW()-INTERVAL '15 minutes' THEN 1 ELSE support_attempts.failures+1 END,started=CASE WHEN support_attempts.started<NOW()-INTERVAL '15 minutes' THEN NOW() ELSE support_attempts.started END`;return response({error:'当前密码不正确'},400)}
      if(body.password===body.currentPassword)return response({error:'新密码不能与当前密码相同'},400);
    }
    const targets=await sql`SELECT username FROM support_users WHERE username=${target}`;
    if(!targets.length&&!(own&&target===process.env.ADMIN_USERNAME))return response({error:'账号不存在'},404);
    await sql.transaction([
      sql`INSERT INTO support_users(username,password,role,version) VALUES(${target},${hashPassword(body.password)},'admin',1) ON CONFLICT(username) DO UPDATE SET password=EXCLUDED.password,version=support_users.version+1`,
      sql`DELETE FROM support_attempts WHERE username=${target} OR username=${'change:'+target}`
    ]);
    const result=response({ok:true,reauthenticate:own});
    if(own)result.headers.set('Set-Cookie','support_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0');
    return result;
  }
  if(action==='platforms'&&!write)return response(await sql`SELECT * FROM support_platforms WHERE active=TRUE OR ${user.role==='admin'} ORDER BY CASE WHEN name=${COMMON_PLATFORM} THEN 0 ELSE 1 END,name`);
  if(action==='entries'&&!write)return response(await sql`SELECT * FROM support_entries WHERE published=TRUE OR ${user.role==='admin'} ORDER BY updated_at DESC`);
  if(action==='image'&&!write){
    const id=Number(new URL(request.url).searchParams.get('id'));
    if(!Number.isSafeInteger(id)||id<1)return response({error:'图片编号无效'},400);
    const images=await sql`SELECT i.mime,i.data FROM support_ticket_images i JOIN support_tickets t ON t.id=i.ticket_id WHERE i.id=${id} AND (t.author=${user.username} OR ${user.role==='admin'})`;
    if(!images.length)return response({error:'图片不存在或无权查看'},404);
    return new Response(Buffer.from(images[0].data,'base64'),{headers:{'Content-Type':images[0].mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"}});
  }
  if(action==='answer'&&write){
    let submission;try{submission=parseQuestion(body)}catch(e){return response({error:e.message},400)}
    const {platform,question,images}=submission;
    if(platform){const found=await sql`SELECT id FROM support_platforms WHERE name=${platform} AND active=TRUE`;if(!found.length)return response({error:'平台已停用或不存在，请重新选择平台'},400)}
    const ticketId=await saveQuestion(sql,user.username,submission);
    const usage=await sql`INSERT INTO support_ai_usage(username,calls) VALUES(${user.username},1) ON CONFLICT(username) DO UPDATE SET calls=CASE WHEN support_ai_usage.started<NOW()-INTERVAL '1 minute' THEN 1 ELSE support_ai_usage.calls+1 END,started=CASE WHEN support_ai_usage.started<NOW()-INTERVAL '1 minute' THEN NOW() ELSE support_ai_usage.started END RETURNING calls`;
    if(usage[0].calls>10&&images.length)return response({mode:'insufficient',ticketId,notice:'请求较频繁，图片问题已登记，请稍后重试或询问技术人员。'});
    if(usage[0].calls>10){
      const rows=await sql`SELECT id,platform,question,answer,keywords,source,published FROM support_entries WHERE (platform=${platform} OR platform=${COMMON_PLATFORM}) AND published=TRUE ORDER BY updated_at DESC`;
      return response({mode:'fallback',ticketId,notice:'AI 请求较频繁，已使用知识库匹配。',matches:searchEntries(rows,'',platform,question)});
    }
    let imageDescription='',lookupQuestion=question;
    if(images.length){
      const recognition=await recognizeImages({images,question:question===IMAGE_QUESTION?'':question,config:modelConfig(process.env,true)});
      if(!recognition.ok)return response({mode:'insufficient',ticketId,notice:recognition.notice});
      imageDescription=recognition.text;
      await sql`UPDATE support_tickets SET image_description=${imageDescription} WHERE id=${ticketId}`;
      lookupQuestion=(question===IMAGE_QUESTION?'':question+'\n')+imageDescription;
    }
    const rows=await sql`SELECT id,platform,question,answer,keywords,source,published FROM support_entries WHERE (platform=${platform} OR platform=${COMMON_PLATFORM}) AND published=TRUE ORDER BY updated_at DESC`;
    const result=await generateAnswer({platform,question:lookupQuestion,rows,config:modelConfig()});
    return response({ticketId,imageDescription,lookupQuestion,...result,...(result.mode==='fallback'?{matches:searchEntries(rows,'',platform,lookupQuestion)}:{})});
  }
  if(action==='ticketFeedback'&&write){
    let feedback;try{feedback=parseTicketFeedback(body)}catch(e){return response({error:e.message},400)}
    const ticket=await saveTicketFeedback(sql,user,feedback);
    if(!ticket)return response({error:'问题不存在或无权操作'},404);
    return response({ok:true,ticket});
  }
  if(action==='deleteTicket'&&write){
    if(user.role!=='admin')return response({error:'需要管理员权限'},403);
    let id;try{id=parseTicketDeleteId(body)}catch(e){return response({error:e.message},400)}
    const deleted=await deleteTicket(sql,id);
    if(!deleted)return response({error:'问题不存在'},404);
    return response({ok:true,id:deleted.id});
  }
  if(action==='tickets'){
    if(!write)return response(await sql`SELECT t.*,COALESCE((SELECT json_agg(json_build_object('id',i.id,'name',i.name) ORDER BY i.id) FROM support_ticket_images i WHERE i.ticket_id=t.id),'[]'::json) AS images FROM support_tickets t ORDER BY resolved ASC,created_at DESC`);
    if(body.id){
      if(user.role!=='admin')return response({error:'需要管理员权限'},403);
      if(!Number.isInteger(body.id)||body.id<1)return response({error:'问题编号无效'},400);
      if(typeof body.answer!=='string'||!body.answer.trim()||body.answer.length>30000)return response({error:'请填写最终回复（最多 30000 字）后再处理成功'},400);
      if(typeof body.platform!=='string'||!body.platform.trim()||body.platform.length>1000)return response({error:'请确认平台后入库'},400);
      const platformRows=await sql`SELECT id FROM support_platforms WHERE name=${body.platform.trim()}`;if(!platformRows.length)return response({error:'请先在平台字典新增该平台'},400);
      if(typeof body.question!=='string'||!body.question.trim()||body.question.length>2000||body.question.trim()===IMAGE_QUESTION)return response({error:'请根据截图补充具体问题描述后入库'},400);
      const rows=await sql`WITH target AS (SELECT * FROM support_tickets WHERE id=${body.id} FOR UPDATE), saved AS (
        INSERT INTO support_entries(province,platform,question,answer,keywords,source,published,ticket_id)
        SELECT province,${body.platform.trim()},${body.question.trim()},${body.answer.trim()},${typeof body.keywords==='string'?body.keywords.slice(0,2000):''},${'待处理问题 #'+body.id},TRUE,id FROM target
        ON CONFLICT(ticket_id) DO UPDATE SET platform=EXCLUDED.platform,question=EXCLUDED.question,answer=EXCLUDED.answer,keywords=EXCLUDED.keywords,published=TRUE,updated_at=NOW() RETURNING ticket_id
      ) UPDATE support_tickets SET question=${body.question.trim()},platform=${body.platform.trim()},resolved=TRUE,answer=${body.answer.trim()} WHERE id IN (SELECT ticket_id FROM saved) RETURNING id`;
      if(!rows.length)return response({error:'问题不存在'},404);
    }
    else{let submission;try{submission=parseQuestion(body)}catch(e){return response({error:e.message},400)}const found=await sql`SELECT id FROM support_platforms WHERE name=${submission.platform} AND active=TRUE`;if(!found.length)return response({error:'平台已停用或不存在，请重新选择平台'},400);await saveQuestion(sql,user.username,submission)}
    return response({ok:true});
  }
  if(user.role!=='admin')return response({error:'需要管理员权限'},403);
  if(action==='publishEntries'&&write){
    let ids;try{ids=parsePublishIds(body.ids)}catch(e){return response({error:e.message},400)}
    const rows=await sql`UPDATE support_entries SET published=TRUE,updated_at=NOW()
      WHERE id=ANY(${ids}::int[]) AND published=FALSE
      AND LENGTH(TRIM(question))>0 AND LENGTH(TRIM(answer))>0
      AND platform IN (SELECT name FROM support_platforms)
      RETURNING id`;
    return response({ok:true,published:rows.length,skipped:ids.length-rows.length});
  }
  if(action==='platforms'&&write){
    if(!validPlatform(body))return response({error:'请填写平台名称（最多200字）、启用状态和有效说明'},400);
    const name=body.name.trim(),notes=body.notes||'';
    if(body.id){
      const old=await sql`SELECT * FROM support_platforms WHERE id=${body.id}`;
      if(!old.length)return response({error:'平台不存在'},404);
      if(old[0].name===COMMON_PLATFORM)return response({error:'系统通用分类不能修改或停用'},400);
      await sql`WITH old AS (SELECT id,name FROM support_platforms WHERE id=${body.id} FOR UPDATE), changed AS (
        UPDATE support_platforms p SET name=${name},notes=${notes},active=${body.active} FROM old WHERE p.id=old.id RETURNING old.name AS old_name,p.name AS new_name
      ), entries AS (UPDATE support_entries e SET platform=c.new_name FROM changed c WHERE e.platform=c.old_name RETURNING e.id)
      UPDATE support_tickets t SET platform=c.new_name FROM changed c WHERE t.platform=c.old_name`;
    }else await sql`INSERT INTO support_platforms(name,notes,active) VALUES(${name},${notes},${body.active})`;
    return response({ok:true});
  }
  if(action==='users'){
    if(!write)return response(await sql`SELECT username,active,role FROM support_users ORDER BY username`);
    if(typeof body.username!=='string'||!body.username.trim()||body.username.length>100||body.username===process.env.ADMIN_USERNAME)return response({error:'请输入有效的新客服账号'},400);
    if(body.username===user.username)return response({error:'请由另一位管理员修改当前账号'},400);
    if(body.password){if(typeof body.password!=='string'||body.password.length<12||body.password.length>256)return response({error:'密码需 12 至 256 位'},400);const role=body.role==='admin'?'admin':'staff';await sql`INSERT INTO support_users(username,password,role) VALUES(${body.username.trim()},${hashPassword(body.password)},${role}) ON CONFLICT(username) DO UPDATE SET password=EXCLUDED.password,role=EXCLUDED.role,active=TRUE,version=support_users.version+1`}
    else await sql`UPDATE support_users SET active=${!!body.active},version=version+1 WHERE username=${body.username}`;
    return response({ok:true});
  }
  if(action==='entries'&&write){
    if(body.delete){await sql`DELETE FROM support_entries WHERE id=${body.id}`;return response({ok:true})}
    const items=body.items||[body];if(!Array.isArray(items)||!items.length||items.length>100||!items.every(validEntry))return response({error:'请完整填写平台、问题及答案，每次最多 100 条'},400);
    const platforms=await sql`SELECT name FROM support_platforms`;if(items.some(e=>!platforms.some(p=>p.name===e.platform.trim())))return response({error:'请先在平台字典维护知识所属平台'},400);
    await sql.transaction(items.map(e=>e.id?sql`UPDATE support_entries SET province=${typeof e.province==='string'?e.province.trim():''},platform=${e.platform.trim()},question=${e.question.trim()},answer=${e.answer.trim()},keywords=${e.keywords||''},source=${e.source||''},published=${!!e.published},updated_at=NOW() WHERE id=${e.id}`:sql`INSERT INTO support_entries(province,platform,question,answer,keywords,source,published) VALUES(${typeof e.province==='string'?e.province.trim():''},${e.platform.trim()},${e.question.trim()},${e.answer.trim()},${e.keywords||''},${e.source||''},${!!e.published})`));return response({ok:true});
  }
  return response({error:'接口不存在'},404);
 }catch(e){if(e.code==='23505')return response({error:'名称已存在，请使用已有条目或更换名称'},409);console.error('Support request failed',e.code||e.name);return response({error:e.message==='DATABASE_NOT_CONFIGURED'?'请配置 DATABASE_URL 数据库连接':'服务暂不可用，请检查部署日志后重试'},503)}
}
export const GET=handler;export const POST=handler;
