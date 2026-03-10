# 湘泰出海门户系统（核心 MVP）

## 启动方式

1. 安装依赖
   - `npm install`
2. 初始化数据库
   - `cp .env.example .env`
   - `npm run db:push`
   - `npm run seed`
3. 启动开发
   - `npm run dev`
   - 打开：`http://127.0.0.1:3002`

## DeepSeek + RAG 服务（FastAPI）

1. 进入 AI 服务目录并安装依赖
   - `cd ai_service`
   - `python3 -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
2. 配置环境变量
   - `cp .env.example .env`
   - 至少填写：`DEEPSEEK_API_KEY`
3. 启动 AI 服务
   - `uvicorn main:app --host 127.0.0.1 --port 8001 --reload`
4. 主站环境变量
   - `.env` 增加：`AI_BACKEND_URL="http://127.0.0.1:8001"`

说明：
- 管理员上传 PDF/MD/TXT 后，会自动切片并写入 ChromaDB 向量库（目录默认 `ai_service/chroma_data`）。
- AI 回答会优先按页面上下文标签检索（如工商页优先检索“工商类”标签文档）。

### Railway 部署 ai_service

```bash
cd "/Users/liuxiong/Desktop/湘泰系统网站/刘雄网站代码/ai_service"
npx @railway/cli login
npx @railway/cli init
npx @railway/cli up
```

在 Railway 服务中配置环境变量：
- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL=https://api.deepseek.com/v1`
- `DEEPSEEK_MODEL=deepseek-chat`
- `CHROMA_DIR=./chroma_data`

部署完成后，将主站 Vercel 的 `AI_BACKEND_URL` 设置为 Railway 分配的公网地址（例如 `https://xxx.up.railway.app`）。

## 启动异常排查

- 如果页面出现 500 或 `Cannot find module './xxx.js'`：
  - 先停止开发服务（`Ctrl + C`）
  - 执行：`npm run dev:clean`
  - 说明：开发模式使用 `.next-dev`，构建使用 `.next`，避免相互覆盖导致白屏/500
- 如果出现 `EMFILE: too many open files, watch`：
  - 已默认启用轮询监听（`WATCHPACK_POLLING=true`）
  - 仍异常时可执行：`ulimit -n 65536` 后再 `npm run dev`

## 默认管理员账号

- 用户名：`admin`
- 密码：`123456`

## 已实现模块

- 首页介绍（公司介绍、方案评估、联系方式）
- 核心政务服务、仓储物流服务、电商增值服务页面
- AI 智能咨询（基于知识库检索回答）
- 静态方案匹配与评估码生成
- 管理员后台（方案库、业务内容、知识库维护）
