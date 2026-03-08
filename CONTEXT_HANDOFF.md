# 湘泰门户项目上下文交接（最新）

## 1) 项目定位与当前实现范围

- 技术栈：Next.js App Router + Prisma + SQLite（开发）+ Tailwind。
- 已实现：官网展示、业务栏目页、AI咨询、静态方案匹配、管理员后台、评估码系统。
- 当前重点：`/solution` 已改造成完整问卷流程（先校验评估码，再填写问卷）。

## 2) 关键页面与路由

- 前台
  - 首页：`/`
  - 工商财税服务：`/government`
  - 产品资质服务：`/qualification`
  - 仓储物流：`/logistics`
  - 电商增值：`/ecommerce`
  - AI咨询：`/consult`
  - 评估问卷：`/solution`
- 管理端
  - 登录：`/admin`
  - 方案库：`/admin/solutions`
  - 评估码生成器：`/admin/evaluation-codes`
  - 业务内容维护：`/admin/services`
  - 知识库：`/admin/kb`

## 3) 评估码机制（一次性）

- 管理员在 `/admin/evaluation-codes` 一次生成 1-10 个评估码。
- 每个评估码支持复制；复制后在当前生成列表中移除（UI层面）。
- 客户端先在 `/solution` 输入评估码，验证通过才显示问卷。
- 问卷提交时评估码被消耗（状态从 `available` -> `used`），一码一次。

## 4) 问卷内容（当前版本）

### 板块一：客户信息（必填）
- 客户姓名
- 客户公司
- 联系电话
- 联系邮箱（含后端格式校验）
- 年营业额

### 板块二：注册需求问卷
- 1. Mall店需求（单选）
- 2. 销售的产品类型（单选）
- 3. 物流清关（单选）
- 4. 资质需求（单选）+ 办理方式（条件出现，二段式）
  - 先选 4.1~4.5，再选 .1~.3（若需）
  - 生成编码如 `4.1.1`
- 5. 工作签证需求（单选）+ 挂靠方式（条件出现，二段式）
  - 先选 5.1/5.2，再选 .1/.2（若需）
  - 生成编码如 `5.1.1`
- 6. 开票需求（6.1/6.2）
- 7. 法人是否能来泰国开户（可以/不可以）
- 8. 补充说明（选填）

## 5) 核心接口

- `POST /api/solutions/verify-code`：校验评估码
- `POST /api/solutions/match`：提交问卷并匹配方案（提交成功即消耗评估码）
- `POST /api/admin/evaluation-codes/generate`：后台生成评估码
- `POST /api/ai/ask`：AI百科咨询
- `GET/POST/PUT /api/admin/solutions`：方案库维护
- `GET/POST/PUT /api/admin/services`：业务内容维护
- `POST /api/admin/kb/import`：知识库导入

## 6) 数据模型（本轮重点）

- `EvaluationAccessCode`
  - `code`, `status(available/used)`, `copiedAt`, `usedAt`
- `SolutionEvaluation` 已包含：
  - 客户信息字段（姓名/公司/电话/邮箱/年营业额）
  - 问卷字段（mall/productType/logisticsType）
  - 第4题编码：`qualificationNeedCode`/`qualificationMethodCode`/`qualificationFinalCode`
  - 第5题编码：`visaNeedCode`/`visaMethodCode`/`visaFinalCode`
  - 第6题：`invoiceNeedCode`
  - 第7题：`accountOpeningAbility`
  - 第8题：`supplementaryNote`

## 7) UI与排版当前状态（问卷页）

- 问卷整体已居中，按顺序纵向排列。
- 问题标题字体已加大（更突出）。
- 选项按钮统一窄宽并居中。
- 补充说明输入框已居中。

## 8) 运行与排错注意事项

- 开发命令：`npm run dev`（默认 127.0.0.1:3002）
- 清缓存重启：`npm run dev:clean`
- 为避免 `next dev` 与 `next build` 产物冲突：
  - 开发目录：`.next-dev`
  - 构建目录：`.next`

## 9) 默认账号与测试

- 管理员账号：`admin`
- 管理员密码：`123456`
- 首次/结构变化后执行：
  - `npm run db:push`
  - `npm run seed`

