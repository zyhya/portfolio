import test from 'node:test';
import assert from 'node:assert/strict';
import {parseQuestion,MAX_IMAGE_BYTES,IMAGE_QUESTION} from '../server/question.js';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=';
const image={name:'截图.png',data:'data:image/png;base64,'+png};
test('文字问题允许不选平台，拒绝空问题及非法字段',()=>{
  assert.deepEqual(parseQuestion({question:' 登录失败 '}),{question:'登录失败',platform:'',images:[]});
  for(const input of [{},{question:' '},{question:123},{question:'a'.repeat(2001)},{question:'x',platform:1},null,[]])assert.throws(()=>parseQuestion(input));
});
test('纯图片问题及图文问题均可登记，规范化附件数据',()=>{
  const result=parseQuestion({images:[image]});
  assert.equal(result.question,IMAGE_QUESTION);
  assert.deepEqual(result.images,[{name:'截图.png',mime:'image/png',data:png}]);
  assert.equal(parseQuestion({question:' 登录错误 ',platform:' A ',images:[image]}).question,'登录错误');
});
test('拒绝过多、超限、伪造、脚本、远程图片及错误编码',()=>{
  assert.throws(()=>parseQuestion({images:Array(4).fill(image)}));
  for(const data of ['https://example.org/image.png','data:image/svg+xml;base64,PHN2Zz4=','data:image/jpeg;base64,'+png,'data:image/png;base64,%%%%','data:image/png;base64,YQ==','data:image/png;base64,'+Buffer.alloc(MAX_IMAGE_BYTES+1).toString('base64')])assert.throws(()=>parseQuestion({images:[{name:'image',data}]}));
  assert.throws(()=>parseQuestion({images:'wrong'}));
  assert.throws(()=>parseQuestion({images:[null]}));
  assert.throws(()=>parseQuestion({images:[{...image,name:'x'.repeat(201)}]}));
  assert.equal(parseQuestion({images:Array(3).fill(image)}).images.length,3);
});
