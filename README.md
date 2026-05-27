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
- 管理员上传 PDF/MD/TXT 后，会自动切片并写入 ChromaDB 向量库（本地默认 `ai_service/chroma_data`，Railway 建议使用持久化目录 `/data/chroma_data`）。
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
- `CHROMA_DIR=/data/chroma_data`

并在 Railway 为 `ai_service` 挂载持久化卷（Volume）到 `/data`，确保管理员投喂的知识库数据长期保留。

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

## 海外仓财务勾兑系统

### 功能说明

- **对账批次管理**：创建、查看、更新、删除对账批次
- **对账明细管理**：逐条添加或批量导入对账数据
- **自动匹配**：系统自动对比我方金额与仓库方金额，标记匹配/差异状态
- **差异处理**：标记差异原因，确认匹配，忽略异常项
- **状态流转**：草稿 → 对账中 → 已确认 / 有争议
- **审计日志**：记录所有操作历史

### 使用流程

1. 在管理后台 `/admin/reconciliation` 创建对账批次
2. 填写仓库名称、对账周期等基本信息
3. 通过「批量导入」或「添加单条」录入对账数据
4. 系统自动计算差异，标记匹配状态
5. 逐条审核差异项，确认或标记原因
6. 确认对账后批次状态变为「已确认」

### 批量导入数据格式

```json
[
  {
    "orderNo": "ORD001",
    "orderDate": "2024-01-15",
    "description": "入库费",
    "myAmount": 1500,
    "whAmount": 1500,
    "currency": "THB"
  },
  {
    "orderNo": "ORD002",
    "orderDate": "2024-01-16",
    "description": "仓储费",
    "myAmount": 3200,
    "whAmount": 3100,
    "currency": "THB"
  }
]
```

### API 接口

- `GET /api/admin/reconciliation` — 查询批次列表（支持 status 筛选、分页）
- `POST /api/admin/reconciliation` — 创建批次
- `PUT /api/admin/reconciliation` — 更新批次
- `DELETE /api/admin/reconciliation` — 删除批次（仅草稿）
- `GET /api/admin/reconciliation/items?batchId=xxx` — 查询明细
- `POST /api/admin/reconciliation/items` — 添加明细
- `PUT /api/admin/reconciliation/items` — 更新明细
- `DELETE /api/admin/reconciliation/items` — 删除明细
- `POST /api/admin/reconciliation/import` — 批量导入
