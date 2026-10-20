import test from 'node:test';
import assert from 'node:assert/strict';
import {modelConfig,modelRequest} from '../server/model-provider.js';
import {generateAnswer} from '../server/ai.js';

test('DeepSeek 为默认文本和视觉服务，使用官方 Flash 模型及单一密钥',()=>{
 const env={DEEPSEEK_API_KEY:'server-only'};
 assert.deepEqual(modelConfig(env),{provider:'deepseek',key:'server-only',baseURL:'https://api.deepseek.com',model:'deepseek-flash',protocol:'chat',enabled:true});
 assert.deepEqual(modelConfig(env,true),{provider:'deepseek',key:'server-only',baseURL:'https://api.deepseek.com',model:'deepseek-flash',protocol:'chat',enabled:true});
 assert.equal(modelConfig({AI_API_KEY:'shared'},true).key,'shared');
});

test('可切换到 OpenAI 或任意 OpenAI 兼容聊天服务',()=>{
 assert.equal(modelConfig({AI_PROVIDER:'openai',OPENAI_API_KEY:'x'}).model,'gpt-4.1-mini');
 const custom=modelConfig({AI_PROVIDER:'compatible',AI_API_KEY:'x',AI_BASE_URL:'https://models.example/v1',AI_MODEL:'chat-1'});
 assert.equal(custom.provider,'compatible');assert.equal(custom.protocol,'chat');assert.equal(custom.baseURL,'https://models.example/v1');
 assert.equal(modelConfig({AI_VISION_PROVIDER:'openai',AI_VISION_API_KEY:'vision',AI_PROVIDER:'deepseek',DEEPSEEK_API_KEY:'text'},true).key,'vision');
});

test('DeepSeek 请求适配 Chat Completions、结构化 JSON 和文字消息',async()=>{
 let actual;
 const response=await modelRequest(modelConfig({DEEPSEEK_API_KEY:'secret'}),{max_output_tokens:1200,store:false,instructions:'只按资料回答。',input:JSON.stringify({question:'测试问题'}),text:{format:{schema:{type:'object'}}}},async(url,options)=>{
  actual={url,options,body:JSON.parse(options.body)};
  return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"answer":"按资料处理"}'}}]})};
 });
 assert.equal(actual.url,'https://api.deepseek.com/chat/completions');
 assert.equal(actual.options.headers.Authorization,'Bearer secret');
 assert.equal(actual.body.model,'deepseek-flash');assert.equal(actual.body.stream,false);
 assert.deepEqual(actual.body.thinking,{type:'disabled'});
 assert.equal(actual.body.response_format.type,'json_object');
 assert.match(actual.body.messages[0].content,/只按资料回答/);
 assert.equal((await response.json()).output[0].content[0].text,'{"answer":"按资料处理"}');
});

test('DeepSeek 截图转成用户图片块并保留 base64 data URL',async()=>{
 let request;
 await modelRequest(modelConfig({AI_API_KEY:'x'}),{instructions:'识别截图。',input:[{role:'user',content:[{type:'input_text',text:'请识别'},{type:'input_image',image_url:'data:image/jpeg;base64,AA==',detail:'high'}]}],text:{format:{schema:{type:'object'}}}},async(url,options)=>{request={url,body:JSON.parse(options.body)};return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:'{"readable":true,"description":"登录错误"}'}}]})}});
 assert.equal(request.url,'https://api.deepseek.com/chat/completions');
 assert.deepEqual(request.body.messages[1].content[1],{type:'image_url',image_url:{url:'data:image/jpeg;base64,AA=='}});
});

test('客服问答通过 DeepSeek 严格引用当前提供的已发布知识',async()=>{
 const rows=[{id:14,platform:'通用',question:'密码错误',answer:'核对账号并联系管理员重置',keywords:'密码,登录',source:'手册',published:true}];
 let input;
 const answer=await generateAnswer({rows,question:'密码忘记了',platform:'平台A',config:modelConfig({DEEPSEEK_API_KEY:'test'}),fetcher:async(url,options)=>{
  input={url,body:JSON.parse(options.body)};
  return {ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify({sufficient:true,answer:'先核对账号；仍失败请联系管理员重置。',source_ids:[14]})}}]})};
 }});
 assert.equal(input.url,'https://api.deepseek.com/chat/completions');
 assert.equal(input.body.messages[1].role,'user');
 assert.match(input.body.messages[1].content,/密码忘记了/);
 assert.equal(answer.mode,'ai');assert.equal(answer.sources[0].id,14);
});

test('协议错误、凭据 URL 和未完成输出安全失败',async()=>{
 const payload={input:'hello',text:{format:{schema:{type:'object'}}}};
 await assert.rejects(modelRequest({key:'x',model:'m',protocol:'unknown',baseURL:'https://a.test'},payload,()=>{}));
 await assert.rejects(modelRequest({key:'x',model:'m',protocol:'chat',baseURL:'https://user:pass@a.test'},payload,()=>{}));
 const response=await modelRequest(modelConfig({DEEPSEEK_API_KEY:'x'}),payload,async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'{}'}}]})}));
 await assert.rejects(response.json(),/模型输出不完整/);
});
