import test from 'node:test';
import assert from 'node:assert/strict';
import {validPlatform,COMMON_PLATFORM} from '../src/platforms.js';
import {ticketStats,chinaDate,csvCell} from '../src/support-stats.js';
import {searchEntries,splitDocument} from '../src/support-model.js';
const tickets=[{id:1,platform:'A',question:'登录失败',resolved:false,created_at:'2026-10-19T16:01:00Z'},
 {id:2,platform:'A',question:' 登录失败 ',resolved:true,created_at:'2026-10-19T15:59:00Z'},
 {id:3,platform:'B',question:'登录失败',resolved:false,created_at:'2026-10-20T03:00:00Z'},
 {id:4,platform:'',question:'页面空白',resolved:true,created_at:'2026-10-20T03:00:00Z'}];
test('统计分平台合并相同问题，保留未指定平台并正确汇总',()=>{
 const r=ticketStats(tickets);assert.equal(r.total,4);assert.equal(r.pending,2);assert.equal(r.resolved,2);assert.equal(r.platforms.length,3);assert.equal(r.issues.length,3);
 assert.equal(r.issues[0].total,2);assert.equal(r.issues[0].tickets.length,2);assert.equal(r.platforms[0].issueCount,1);
});
test('按北京时间日期和平台、状态、关键词筛选',()=>{
 assert.equal(chinaDate(tickets[0].created_at),'2026-10-20');
 assert.equal(ticketStats(tickets,{start:'2026-10-20',end:'2026-10-20'}).total,3);
 assert.equal(ticketStats(tickets,{platform:'A',status:'pending',query:'登录'}).total,1);
 assert.equal(ticketStats(tickets,{platform:''}).total,1);assert.equal(ticketStats([]).total,0);
});
test('未识别的图片问题不误合并，识别结果可检索',()=>{
 const q='图片问题（请管理员补充问题描述）';
 const rows=[{...tickets[0],question:q},{...tickets[0],id:5,question:q},{...tickets[0],id:6,question:q,image_description:'摄像头报错'}];
 assert.equal(ticketStats(rows).issues.length,3);assert.equal(ticketStats(rows,{query:'摄像头'}).total,1);
});
test('平台字典拒绝空白、非法状态、过长名称和错误编号',()=>{
 assert.equal(validPlatform({name:' 测试平台 ',active:true}),true);
 for(const p of [{name:'',active:true},{name:'a'.repeat(201),active:true},{name:'A',active:'yes'},{name:'A',active:true,id:-1}])assert.equal(validPlatform(p),false);
});
test('通用知识可供任意平台检索，不泄漏其他专属平台资料',()=>{
 const rows=['A','B',COMMON_PLATFORM].map((platform,id)=>({id,platform,question:'密码错误',answer:'联系管理员',keywords:'密码',published:true}));
 assert.deepEqual(searchEntries(rows,'','A','密码').map(r=>r.platform),['A',COMMON_PLATFORM]);
 assert.deepEqual(searchEntries(rows,'','','密码').map(r=>r.platform),[COMMON_PLATFORM]);
});
test('问答标题保留处理步骤，支持末行内嵌通用回复',()=>{
 const result=splitDocument('问题：1、登录失败\n1、检查平台\n2、检查账号\n问题：14、视频卡顿、黑屏通用回复：刷新、换网、联系技术','test');
 assert.equal(result.length,2);assert.equal(result[0].answer,'1、检查平台\n2、检查账号');assert.equal(result[1].question,'视频卡顿、黑屏');assert.equal(result[1].answer,'刷新、换网、联系技术');
});
test('CSV 保留逗号换行并防止公式注入',()=>{
 assert.equal(csvCell('a,"b"'),'"a,""b"""');assert.equal(csvCell('=1+1'),'"\'=1+1"');assert.equal(csvCell(2),'"2"');
});
