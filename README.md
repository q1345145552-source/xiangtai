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
