# OpenAI 配置

Vercel → portfolio → Settings → Environment Variables，为 Production 添加：

| 名称 | 值 |
|---|---|
| OPENAI_API_KEY | 在 OpenAI API 平台创建的密钥，仅在 Vercel 中填写 |
| OPENAI_MODEL | gpt-4.1-mini，或账号有权限且支持 Responses API 与 Structured Outputs 的模型 |

保存后在 Deployments 对最新版本 Redeploy。不要把密钥发给客服或提交到 GitHub，也不要使用 VITE_ 前缀。

本实现固定连接 https://api.openai.com/v1/responses，仅适用于 OpenAI 官方密钥；第三方转发服务的密钥不能直接使用。

验证步骤：先在后台发布一条真实平台问答；客服选择该平台，换一种问法提交，检查提示“AI 回复”及引用资料。每次提交仍记录待处理问题。资料不足时不生成操作步骤；未配置、超时或调用失败时提示并回退关键词匹配。

注意：提问及最多 12 条相关平台知识会发送至 OpenAI API，请先去除个人信息。请求设置 store:false。API 用量按服务商账单计费，请在 OpenAI 控制台设置预算提醒。没有执行真实 API 调用测试，需要配置后验证模型权限、余额及实际问答效果。

当前为中文双字匹配选取资料后让模型理解生成，不是向量检索；知识较多或语义差异较大时仍可能漏检。AI 输出不能直接自动入库，仍需管理员确认处理。

## 截图自动识别

复用 OPENAI_API_KEY。可选增加 OPENAI_VISION_MODEL，需支持图片输入及 Structured Outputs；不填则使用 OPENAI_MODEL，均未填写时默认 gpt-4.1-mini。配置变更后重新部署。

客服上传或粘贴最多 3 张截图后点击生成：先保存问题和附件，再识别图片，最后结合所选平台的已发布资料生成回复。没有选平台时仅展示识别结果并转人工；图片模糊、识别失败、无密钥或资料不足均保留待处理记录。识别文字可能出错，请在发送回复及发布知识前核对原图。截图也会发送至 OpenAI，上传前请遮挡个人信息；不自动脱敏原图。每次图文请求最多使用两次模型调用，均设置 store:false。

接口实现依据：https://developers.openai.com/api/docs/guides/images-vision 。自动化测试使用模拟模型响应，不代表实际账号的模型权限、额度或中文识图准确率已验证。
