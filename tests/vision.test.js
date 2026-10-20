import test from 'node:test';
import assert from 'node:assert/strict';
import {recognizeImages} from '../server/vision.js';
const base={images:[{mime:'image/png',data:'test-image'}],question:'为什么登录不了',key:'test-key'};
const result=value=>({ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(value)}]}]})});
test('未配置密钥或无图片不调用模型',async()=>{
  const fetcher=()=>{throw new Error('不应调用')};
  assert.equal((await recognizeImages({...base,key:'',fetcher})).ok,false);
  assert.equal((await recognizeImages({...base,images:[],fetcher})).ok,false);
});
test('图片传给视觉模型并解析描述，不保存响应',async()=>{
  const actual=await recognizeImages({...base,model:'vision-test',fetcher:async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');
    const payload=JSON.parse(options.body);
    assert.equal(payload.model,'vision-test');assert.equal(payload.store,false);
    assert.equal(payload.input[0].content[1].type,'input_image');
    assert.equal(payload.input[0].content[1].image_url,'data:image/png;base64,test-image');
    assert.equal(payload.text.format.strict,true);
    return result({readable:true,description:' 登录页面提示账号或密码错误 '});
  }});
  assert.deepEqual(actual,{ok:true,text:'登录页面提示账号或密码错误'});
});
test('图片模糊、拒答、无效内容和异常不得当成成功识别',async()=>{
  for(const value of [{readable:false,description:''},{readable:true,description:''},{readable:true,description:'x'.repeat(2001)},{readable:'true',description:'错误'}])assert.equal((await recognizeImages({...base,fetcher:async()=>result(value)})).ok,false);
  for(const fetcher of [async()=>({ok:false,status:401}),async()=>({ok:false,status:429}),async()=>{throw new Error('timeout')},async()=>({ok:true,json:async()=>({status:'incomplete'})})])assert.equal((await recognizeImages({...base,fetcher})).ok,false);
});
