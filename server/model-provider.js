const PRESETS={
 deepseek:{baseURL:'https://api.deepseek.com',model:'deepseek-flash',protocol:'chat'},
 openai:{baseURL:'https://api.openai.com/v1',model:'gpt-4.1-mini',protocol:'responses'},
 compatible:{baseURL:'',model:'',protocol:'chat'}
};
export function modelConfig(env=process.env,vision=false){
 const provider=(vision?env.AI_VISION_PROVIDER:undefined)||env.AI_PROVIDER||'deepseek';
 const preset=PRESETS[provider];if(!preset)throw new Error('不支持的 AI 服务商');
 const same=provider===(env.AI_PROVIDER||'deepseek');
 const namedKey=provider==='deepseek'?env.DEEPSEEK_API_KEY:provider==='openai'?env.OPENAI_API_KEY:'';
 const config={provider,
 key:(vision?env.AI_VISION_API_KEY:undefined)||(same?env.AI_API_KEY:undefined)||namedKey||'',
 baseURL:(vision?env.AI_VISION_BASE_URL:undefined)||(same?env.AI_BASE_URL:undefined)||preset.baseURL,
 model:(vision?env.AI_VISION_MODEL:undefined)||(vision&&provider==='openai'?env.OPENAI_VISION_MODEL:undefined)||(same?env.AI_MODEL:undefined)||(provider==='openai'?env.OPENAI_MODEL:undefined)||preset.model,
 protocol:(vision?env.AI_VISION_PROTOCOL:undefined)||(same?env.AI_PROTOCOL:undefined)||preset.protocol};
 const visionFlag=env.AI_VISION_ENABLED;
 config.enabled=!vision||visionFlag==='true'||(visionFlag!=='false'&&((provider==='deepseek'&&config.model==='deepseek-flash')||provider==='openai'));
 return config;
}
export const legacyConfig=(key,model)=>({provider:'openai',key,model:model||'gpt-4.1-mini',baseURL:'https://api.openai.com/v1',protocol:'responses',enabled:true});

// Accept an internal Responses-shaped request, adapt it to the configured protocol.
export async function modelRequest(config,payload,fetcher=fetch){
 if(!config.key||!config.model||!['chat','responses'].includes(config.protocol))throw new Error('AI 配置不完整');
 const url=new URL(config.baseURL);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error('AI 接口地址必须使用 HTTPS 且不含凭据或查询参数');
 const base=url.toString().replace(/\/$/,'');
 let body={...payload,model:config.model};
 if(config.protocol==='chat'){
  const input=typeof payload.input==='string'?[{role:'user',content:payload.input}]:payload.input;
  const messages=input.map(message=>({...message,content:Array.isArray(message.content)?message.content.map(part=>part.type==='input_image'?{type:'image_url',image_url:{url:part.image_url}}:{type:'text',text:part.text}):message.content}));
  const schema=payload.text.format.schema;
  body={model:config.model,stream:false,max_tokens:payload.max_output_tokens,
   messages:[{role:'system',content:payload.instructions+'\n只返回 JSON。JSON 输出必须符合以下结构：'+JSON.stringify(schema)},...messages],response_format:{type:'json_object'}};
  if(config.provider==='deepseek')body.thinking={type:'disabled'};
 }
 const res=await fetcher(base+(config.protocol==='chat'?'/chat/completions':'/responses'),{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
 if(!res.ok)return res;
 return {ok:true,json:async()=>{
  const data=await res.json();if(config.protocol==='responses')return data;
  const choice=data.choices?.[0];if(choice?.finish_reason!=='stop'||typeof choice.message?.content!=='string'||choice.message.refusal)throw new Error('模型输出不完整');
  return {status:'completed',output:[{content:[{type:'output_text',text:choice.message.content}]}]};
 }};
}
