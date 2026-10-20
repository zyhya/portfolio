import test from 'node:test';
import assert from 'node:assert/strict';
import {followupDue} from '../src/ticket-followup.js';
import {parseTicketFeedback,saveTicketFeedback} from '../server/ticket-feedback.js';
const done={id:'turn1',ticketId:12,status:'done',completedAt:1000};
test('最后一次回答完成满一分钟才询问，后续提问重新计时',()=>{
 assert.equal(followupDue([done],500,60999),false);
 assert.equal(followupDue([done],500,61000),true);
 assert.equal(followupDue([done],50000,61000),false);
 assert.equal(followupDue([done],50000,110000),true);
 assert.equal(followupDue([done,{status:'pending'}],50000,110000),false);
});
test('不询问失败、未保存、已反馈或正在操作的问题',()=>{
 for(const turn of [{...done,status:'error'},{...done,ticketId:null},{...done,completedAt:undefined},{...done,feedbackResolved:true},{...done,feedbackResolved:false}])assert.equal(followupDue([turn],0,999999),false);
 assert.equal(followupDue([done],0,999999,true),false);
 assert.equal(followupDue([],0,999999),false);
});
test('状态接口只接受有效编号和明确的布尔值',()=>{
 for(const body of [null,{}, {id:1,resolved:'false'},{id:-1,resolved:true},{id:1.2,resolved:true},{id:2147483648,resolved:true}])assert.throws(()=>parseTicketFeedback(body));
 assert.deepEqual(parseTicketFeedback({id:2,resolved:false}),{id:2,resolved:false});
 assert.deepEqual(parseTicketFeedback({id:2,resolved:true}),{id:2,resolved:true});
});
test('反馈更新带所有者校验，重复或管理员已处理时返回已有状态',async()=>{
 const queries=[];let responses=[[],[{id:12,resolved:true,feedback_resolved:null}]];
 const sql=async(strings,...values)=>{queries.push({text:strings.join('?'),values});return responses.shift()};
 const result=await saveTicketFeedback(sql,{username:'staff1',role:'staff'},{id:12,resolved:false});
 assert.equal(result.resolved,true);
 assert.equal(queries.length,2);
 assert.match(queries[0].text,/feedback_resolved IS NULL AND resolved=FALSE/);
 for(const query of queries){assert.ok(query.text.includes("author=? OR ?"));assert.ok(query.values.includes('staff1'));assert.equal(query.values.at(-1),false)}
 responses=[[],[]];assert.equal(await saveTicketFeedback(sql,{username:'other',role:'staff'},{id:12,resolved:true}),null);
 responses=[[{id:12,resolved:false,feedback_resolved:false}]];assert.equal((await saveTicketFeedback(sql,{username:'staff1',role:'staff'},{id:12,resolved:false})).feedback_resolved,false);
});
