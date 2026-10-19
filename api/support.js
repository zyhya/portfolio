import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { generateAnswer } from '../server/ai.js';

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
    await sql`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS answer TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE support_entries ADD COLUMN IF NOT EXISTS ticket_id INT UNIQUE`;
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
export async function handler(request) {
 try {
  const secret=process.env.JWT_SECRET;
  if (!secret || secret.length<32 || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return response({error:'请先在部署后台配置管理员账号、密码和至少 32 位的 JWT_SECRET'},503);
  const sql=database();await init(sql);
  const action=new URL(request.url).searchParams.get('action')||'entries';
  const write=request.method==='POST';
  if(write){const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return response({error:'请求来源无效'},403)}
  if(!['GET','POST'].includes(request.method))return response({error:'不支持此请求'},405);
  let body={};if(write){const text=await request.text();if(text.length>1500000)return response({error:'导入内容过大，请分批处理'},413);try{body=JSON.parse(text)}catch{return response({error:'请求格式错误'},400)}}
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
  if(action==='entries'&&!write)return response(await sql`SELECT * FROM support_entries WHERE published=TRUE OR ${user.role==='admin'} ORDER BY updated_at DESC`);
  if(action==='answer'&&write){
    if(typeof body.question!=='string'||!body.question.trim()||body.question.length>2000||(body.platform!=null&&(typeof body.platform!=='string'||body.platform.length>1000)))return response({error:'请填写有效问题'},400);
    const platform=(body.platform||'').trim(),question=body.question.trim();
    const tickets=await sql`INSERT INTO support_tickets(province,platform,question,author) VALUES('',${platform},${question},${user.username}) RETURNING id`;
    const ticketId=tickets[0].id;
    if(!platform)return response({mode:'insufficient',ticketId,notice:'问题已提交到待处理列表；未指定平台，等待管理员确认平台后回复。'});
    const usage=await sql`INSERT INTO support_ai_usage(username,calls) VALUES(${user.username},1) ON CONFLICT(username) DO UPDATE SET calls=CASE WHEN support_ai_usage.started<NOW()-INTERVAL '1 minute' THEN 1 ELSE support_ai_usage.calls+1 END,started=CASE WHEN support_ai_usage.started<NOW()-INTERVAL '1 minute' THEN NOW() ELSE support_ai_usage.started END RETURNING calls`;
    if(usage[0].calls>10)return response({mode:'fallback',ticketId,notice:'请求较频繁，问题已登记，暂用知识库匹配。'});
    const rows=await sql`SELECT id,question,answer,keywords,source FROM support_entries WHERE platform=${platform} AND published=TRUE ORDER BY updated_at DESC`;
    return response({ticketId,...await generateAnswer({platform,question,rows,key:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL})});
  }
  if(action==='tickets'){
    if(!write)return response(await sql`SELECT * FROM support_tickets ORDER BY resolved ASC,created_at DESC`);
    if(body.id){
      if(user.role!=='admin')return response({error:'需要管理员权限'},403);
      if(!Number.isInteger(body.id)||body.id<1)return response({error:'问题编号无效'},400);
      if(typeof body.answer!=='string'||!body.answer.trim()||body.answer.length>30000)return response({error:'请填写最终回复（最多 30000 字）后再处理成功'},400);
      if(typeof body.platform!=='string'||!body.platform.trim()||body.platform.length>1000)return response({error:'请确认平台后入库'},400);
      const rows=await sql`WITH target AS (SELECT * FROM support_tickets WHERE id=${body.id} FOR UPDATE), saved AS (
        INSERT INTO support_entries(province,platform,question,answer,keywords,source,published,ticket_id)
        SELECT province,${body.platform.trim()},question,${body.answer.trim()},${typeof body.keywords==='string'?body.keywords.slice(0,2000):''},${'待处理问题 #'+body.id},TRUE,id FROM target
        ON CONFLICT(ticket_id) DO UPDATE SET platform=EXCLUDED.platform,answer=EXCLUDED.answer,keywords=EXCLUDED.keywords,published=TRUE,updated_at=NOW() RETURNING ticket_id
      ) UPDATE support_tickets SET platform=${body.platform.trim()},resolved=TRUE,answer=${body.answer.trim()} WHERE id IN (SELECT ticket_id FROM saved) RETURNING id`;
      if(!rows.length)return response({error:'问题不存在'},404);
    }
    else{if(typeof body.question!=='string'||!body.question.trim()||body.question.length>2000||(body.platform!=null&&(typeof body.platform!=='string'||body.platform.length>1000)))return response({error:'请填写有效问题'},400);await sql`INSERT INTO support_tickets(province,platform,question,author) VALUES('',${(body.platform||'').trim()},${body.question.trim()},${user.username})`}
    return response({ok:true});
  }
  if(user.role!=='admin')return response({error:'需要管理员权限'},403);
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
    await sql.transaction(items.map(e=>e.id?sql`UPDATE support_entries SET province=${typeof e.province==='string'?e.province.trim():''},platform=${e.platform.trim()},question=${e.question.trim()},answer=${e.answer.trim()},keywords=${e.keywords||''},source=${e.source||''},published=${!!e.published},updated_at=NOW() WHERE id=${e.id}`:sql`INSERT INTO support_entries(province,platform,question,answer,keywords,source,published) VALUES(${typeof e.province==='string'?e.province.trim():''},${e.platform.trim()},${e.question.trim()},${e.answer.trim()},${e.keywords||''},${e.source||''},${!!e.published})`));return response({ok:true});
  }
  return response({error:'接口不存在'},404);
 }catch(e){console.error('Support request failed',e.code||e.name);return response({error:e.message==='DATABASE_NOT_CONFIGURED'?'请配置 DATABASE_URL 数据库连接':'服务暂不可用，请检查部署日志后重试'},503)}
}
export const GET=handler;export const POST=handler;
