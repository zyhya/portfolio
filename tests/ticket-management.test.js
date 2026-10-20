import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteTicket,parseTicketDeleteId} from '../server/ticket-management.js';

test('删除编号仅接受有效的问题主键',()=>{
  assert.equal(parseTicketDeleteId({id:1}),1);
  for(const body of [null,{},[],{id:0},{id:-1},{id:1.2},{id:'1'},{id:2147483648}])assert.throws(()=>parseTicketDeleteId(body));
});

test('删除问题时先解除知识关联，再删除问题以级联清理截图',async()=>{
  const queries=[];
  const sql=(strings,...values)=>({text:strings.join('?'),values});
  sql.transaction=async statements=>{
    queries.push(...statements);
    return [[],[{id:12}]];
  };
  assert.deepEqual(await deleteTicket(sql,12),{id:12});
  assert.match(queries[0].text,/UPDATE support_entries SET ticket_id=NULL WHERE ticket_id=\?/);
  assert.match(queries[1].text,/DELETE FROM support_tickets WHERE id=\? RETURNING id/);
  assert.deepEqual(queries.map(query=>query.values),[[12],[12]]);
});

test('不存在的问题返回空结果',async()=>{
  const sql=(strings,...values)=>({text:strings.join('?'),values});
  sql.transaction=async()=>[[],[]];
  assert.equal(await deleteTicket(sql,999),null);
});
