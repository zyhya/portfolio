# AI 模型配置

默认服务商为 DeepSeek，模型为 `deepseek-flash`，同时支持文字问答和截图识别。密钥只保存在 Vercel 服务端环境变量，不要加 `VITE_` 前缀、发给客服或提交到 GitHub。

## DeepSeek

在 Vercel 项目 Settings → Environment Variables → Production 添加：

| 名称 | 值 |
|---|---|
| `AI_PROVIDER` | `deepseek` |
| `AI_API_KEY` | DeepSeek API 密钥，也可用 `DEEPSEEK_API_KEY` |
| `AI_MODEL` | 可选；默认 `deepseek-flash` |

截图识别默认复用同一服务商、模型和密钥。DeepSeek 官方文档确认 `deepseek-flash` 支持图片输入。

## 更换服务商

OpenAI：`AI_PROVIDER=openai`、`OPENAI_API_KEY=...`；可选 `OPENAI_MODEL`，默认 `gpt-4.1-mini`。

其他兼容 OpenAI Chat Completions 的模型服务：设置 `AI_PROVIDER=compatible`、`AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`；`AI_PROTOCOL` 默认 `chat`，仅在服务明确支持 Responses API 时改为 `responses`。接口地址必须是 HTTPS，不要把密钥放进 URL。

如需单独配置截图模型，可设置 `AI_VISION_PROVIDER`、`AI_VISION_API_KEY`、`AI_VISION_BASE_URL`、`AI_VISION_MODEL` 和 `AI_VISION_PROTOCOL`。设 `AI_VISION_ENABLED=false` 可关闭截图识别；默认使用主模型配置。

添加或修改环境变量后，在 Vercel 对最新版本重新部署。AI 调用会按相应服务商的计费规则产生费用，请在服务商后台设置预算与用量提醒。模型故障、额度不足、无效结构或不能可靠引用资料时，系统会回退到知识库匹配或转人工。

## 运行方式

每次提交都会先保存待处理问题。服务端只读取所选平台和“通用”分类的已发布知识，按问题、关键词和答案挑选最多 12 条相关资料。配置了模型且有可用资料时，模型根据问题和这些资料生成中文回复，并必须引用实际提供的知识编号；资料不足或回答没有有效资料编号时不会展示模型编造的答案。

没配置模型时，系统直接按关键词检索知识库；模型暂时不可用时也回退到关键词匹配。没有匹配结果会提示询问技术人员，问题仍保留在待处理列表。管理员处理成功并审核后，才会将最终回复保存为已发布知识。

带截图的问题会先调用视觉模型识别截图里的页面和报错，再将识别文字与学员描述合并进行知识匹配和回复生成，最多调用两次模型。图片模糊或识别失败时，原问题和图片仍已保存，系统转人工。图片会发送到配置的 AI 服务；发送前应遮挡学员姓名、手机号、身份证号等个人信息。请求使用 `store:false` 仅在兼容的 Responses 协议下生效；不同服务商的数据处理和保留规则需查看其官方说明。

模型自动化测试使用模拟响应，没有真实调用服务商 API。DeepSeek 官方资料：

- [API 快速开始](https://api-docs.deepseek.com/)
- [图片输入](https://api-docs.deepseek.com/guides/vision)
