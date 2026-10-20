import test from 'node:test';
import assert from 'node:assert/strict';
import {filterKnowledge,parsePublishIds} from '../src/knowledge-management.js';
import {searchEntries} from '../src/support-model.js';

const rows=[
  {id:1,platform:'通用',question:'账号无法登录',answer:'检查手机号',keywords:'密码,登录',source:'FAQ文档',published:false},
  {id:2,platform:'平台A',question:'视频异常',answer:'清理缓存后重试',keywords:'播放,黑屏',source:'操作手册',published:true},
  {id:3,platform:'通用',question:'人脸超时',answer:'允许相机权限',published:true}
];
test('管理检索支持部分匹配、大小写、多个关键词和可缺省字段',()=>{
  assert.deepEqual(filterKnowledge(rows,'密').map(e=>e.id),[1]);
  assert.deepEqual(filterKnowledge(rows,'faq 手机').map(e=>e.id),[1]);
  assert.deepEqual(filterKnowledge(rows,'平台A，缓存').map(e=>e.id),[2]);
  assert.deepEqual(filterKnowledge(rows,'不存在'),[]);
  assert.equal(filterKnowledge(rows,'  ').length,3);
});
test('草稿和已发布筛选与关键词叠加，切回全部可恢复',()=>{
  assert.deepEqual(filterKnowledge(rows,'','draft').map(e=>e.id),[1]);
  assert.deepEqual(filterKnowledge(rows,'','published').map(e=>e.id),[2,3]);
  assert.deepEqual(filterKnowledge(rows,'密码','published'),[]);
  assert.equal(filterKnowledge(rows,'密码','all').length,1);
});
test('批量发布只接受有限数量的有效整数编号，并去重',()=>{
  assert.deepEqual(parsePublishIds([1,2,1]),[1,2]);
  for(const ids of [null,[],['1'],[0],[-1],[1.5],[true],[2147483648],Array(101).fill(1)])assert.throws(()=>parsePublishIds(ids));
});
test('新一次检索反映发布、修改及撤回后的资料状态',()=>{
  const latest=rows.map(e=>({...e}));
  assert.equal(searchEntries(latest,'','','密码').length,0);
  latest[0].published=true;
  assert.equal(searchEntries(latest,'','','密码')[0].answer,'检查手机号');
  latest[0].answer='以管理员最新操作说明为准';
  assert.equal(searchEntries(latest,'','','密码')[0].answer,'以管理员最新操作说明为准');
  latest[0].published=false;
  assert.equal(searchEntries(latest,'','','密码').length,0);
});
