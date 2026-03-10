import Image from "next/image";
import Link from "next/link";
import founderBg from "../../assets/刘雄1.png";
import homeHeroBg from "../../assets/首页1.jpg";
import { FloatingAiChat } from "@/components/floating-ai-chat";
import { CONTACT_INFO } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-2xl border border-red-900/50 bg-cover p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] md:p-10"
        style={{ backgroundImage: `url(${homeHeroBg.src})`, backgroundPosition: "center 20%" }}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-red-950/75" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-14 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.25em] text-red-300">Xiangtai Global</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">湘泰出海 · 泰国一站式本土服务平台</h1>
          <p className="mt-3 max-w-3xl text-zinc-200">
            湘泰国际深耕泰国本土市场，围绕公司注册、财税合规、资质认证、电商运营与物流仓储提供全链路落地服务。
          </p>
          <div className="mt-5 grid max-w-3xl grid-cols-3 gap-3 text-center text-sm md:text-base">
            <div className="rounded-lg border border-red-500/30 bg-black/30 p-3 transition duration-300 hover:-translate-y-1 hover:border-red-400/60 hover:bg-red-950/30">
              <p className="text-xl font-semibold text-red-300 md:text-2xl">280+</p>
              <p className="text-zinc-200">服务品牌/卖家</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-black/30 p-3 transition duration-300 hover:-translate-y-1 hover:border-red-400/60 hover:bg-red-950/30">
              <p className="text-xl font-semibold text-red-300 md:text-2xl">1,200+</p>
              <p className="text-zinc-200">本土合作资源</p>
            </div>
            <div className="rounded-lg border border-red-500/30 bg-black/30 p-3 transition duration-300 hover:-translate-y-1 hover:border-red-400/60 hover:bg-red-950/30">
              <p className="text-xl font-semibold text-red-300 md:text-2xl">98%</p>
              <p className="text-zinc-200">项目按期落地</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/solution"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-red-700 to-red-600 px-4 py-2 font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(220,38,38,0.35)] active:scale-[0.98]"
            >
              免费评估
            </Link>
            <Link
              href="/consult"
              className="inline-flex items-center justify-center rounded-lg border border-red-400/50 bg-black/30 px-4 py-2 font-medium text-red-100 transition duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-900/30 hover:text-white active:scale-[0.98]"
            >
              AI 智能咨询
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="group rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-red-500/70 hover:shadow-[0_14px_32px_rgba(153,27,27,0.28)]">
          <h2 className="text-xl font-semibold text-red-300">湘泰出海 (Xiangtai Outbound) —— 泰国本土化增长引擎</h2>

          <div className="mt-4 space-y-3 text-zinc-300">
            <p className="font-medium text-red-200">【公司背景：深耕本土，全生命周期护航】</p>
            <p>
              湘泰出海（Xiangtai Shopping Co., Ltd.）形成泰国曼谷、泰国清迈、中国深圳三地联动的战略布局，是一家专注于中泰跨境商业落地的综合性企业服务平台。
            </p>
            <p>
              我们深知中国企业出海的痛点：缺的不是好产品，而是懂当地规则的“引路人”。因此，湘泰出海不仅是帮您跑腿办证的代办机构，更是中国品牌出海泰国的**“本土联合创始人”**。从企业落地初期的合法合规架构搭建，到产品准入资质的壁垒攻坚，再到中后期的仓储物流履约与全域营销变现，湘泰出海为您提供 100% 覆盖企业“全生命周期”的保姆式闭环服务，让您在异国他乡安心扎根，长久盈利。
            </p>
          </div>

          <div className="mt-4 space-y-3 text-zinc-300">
            <p className="font-medium text-red-200">【综合实力：构建坚不可摧的“五位一体”护城河】</p>
            <p>在泰国严打灰产与税务违规的今天，我们拒绝拼凑式的外包服务，坚持以自营硬实力打造咨询、注册、资质、仓配、物流的一体化解决方案：</p>
            <ol className="list-decimal space-y-3 pl-5">
              <li>
                <p className="font-medium text-red-100">顶层合规与企服：筑牢安全底线，拒绝税务暴雷</p>
                <p>
                  企业架构与财税：严格遵循泰国《外商投资法》，提供杜绝“灰色代持”风险的中泰合资公司注册方案。提供真实的商业地址挂靠、PP.20 增值税正规申报及专业的本土财税代理记账，从源头切断税务隐患。
                </p>
                <p>
                  人事与用工合规：为您的出海团队提供中籍高管工作签证（Non-B &amp; Work Permit）、缅甸籍员工合法劳工证办理，以及社保代理与泰籍名额匹配服务，彻底解决本地用工荒与合规风险。
                </p>
              </li>
              <li>
                <p className="font-medium text-red-100">核心资质壁垒：打破准入门槛，极速合规上架</p>
                <p>
                  独家 FDA / DLD 挂靠通关：针对美妆、食品、医疗器械及畜牧产品，中国卖家往往因在泰无实体工厂而无法获取批文。湘泰出海提供独家资质挂靠服务，客户无需斥巨资自建达标工厂，即可在 20-30 天内极速斩获泰国官方认证，直接打通合法上架特权。
                </p>
                <p>
                  全品类知识产权护航：同步提供 TISI（强制性工业标准）、NBTC（电信设备）认证，以及泰国本地商标（R标）与外观专利的极速申请，为您的品牌建立最强法律护城河。
                </p>
              </li>
              <li>
                <p className="font-medium text-red-100">高阶渠道赋能：打通流量高地，实现品效合一</p>
                <p>
                  Mall 店（品牌旗舰店）绿通：普通店卷价格，Mall 店做品牌。我们拥有 Shopee Mall、Lazada Mall 及 TikTok Mall 店的专属入驻绿色通道，帮您高效搞定入驻所需的全套资质底座（DBD+PP.20+R标回执）。
                </p>
                <p>
                  TikTok 本土化营销全案：不只是开店，更帮您卖货。提供 TikTok 专属直播间“人、货、场”的本地化搭建服务，并拥有成熟的泰国本土达人（KOL/KOC）短视频矩阵分发能力，引爆流量。
                </p>
              </li>
              <li>
                <p className="font-medium text-red-100">极速本土履约：掌控物流命脉，降本增效</p>
                <p>
                  双轨制头程物流：自建中泰物流网络，提供“双清包税”极速专线，以及能出具关单、配合 FE 免税进口的“正规清关（正清）”服务，完美匹配品牌大卖的税务合规需求。
                </p>
                <p>
                  重资产尾程网络：自有 70 台货车组成的庞大车队全天候待命，覆盖曼谷及周边地区，实现免费极速拆派。配合湘泰本土云仓，支持“一件代发”，轻松实现订单当日达或次日达，极致提升买家体验。
                </p>
              </li>
              <li>
                <p className="font-medium text-red-100">风控与疑难杂症：您的跨境“急救室”</p>
                <p>
                  跨境之路难免突发危机，我们在泰国拥有深厚的本土政商资源与法务团队，专治各种跨境疑难杂症。无论是面临店铺无故封禁、资金/余额冻结，还是遭遇同行恶意差评与侵权投诉，湘泰都能为您提供专业的解封申诉与危机公关服务，挽救您的核心资产。
                </p>
              </li>
            </ol>
            <p className="font-medium text-red-200">出海泰国，首选湘泰。我们不仅为您扫清落地障碍，更为您的每一笔跨国交易保驾护航！</p>
          </div>
        </div>
        <div
          className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-cover bg-center p-6 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-red-500/70 hover:shadow-[0_14px_32px_rgba(153,27,27,0.28)]"
          style={{ backgroundImage: `url(${founderBg.src})` }}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-red-950/40" />
          <div className="absolute right-4 top-4 z-10 h-24 w-24 overflow-hidden rounded-full border-2 border-red-300/90 shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
            <Image src={founderBg} alt="创始人刘雄" className="h-full w-full object-cover" />
          </div>
          <h2 className="relative z-10 pr-28 text-xl font-semibold text-red-300">创始人介绍</h2>
          <div className="relative z-10 mt-3 space-y-3 pr-28 text-zinc-300">
            <p className="text-lg font-semibold text-red-200">湘泰出海创始人 —— 刘雄 (Mike)</p>
            <p className="italic text-zinc-200">“出海不是一场短期流量的收割，而是在异国他乡建立一座坚不可摧的商业堡垒。”</p>
            <p>
              在汹涌的出海浪潮中，泰国已成为中国品牌逐鹿东南亚的核心阵地。但真正能在泰国赚到钱、扎下根的企业，靠的绝不仅仅是产品和流量，而是对本土合规的极致敬畏，以及重资产落地的硬核实力。
            </p>
            <p>我是刘雄，湘泰出海 (Xiangtai Outbound) 创始人。</p>

            <p className="font-medium text-red-200">打造壁垒：用“重兵”重塑企服标准</p>
            <p>
              在创立湘泰出海之初，我就本着为出海企业创造便利，减少踩坑的宗旨触发。中国企业出海，最怕的不是没订单，而是因为“水土不服”导致全盘皆输。
            </p>
            <p>
              因此，我带领湘泰团队，走了一条最难、但也最稳的路——做本土商业基础设施的建设者。我们不甘心只做“跑腿盖章”的代办，而是努力打造一支专业，靠谱的出海服务团队；我们死磕最难的官方关卡，为客户打通了 FDA / DLD 通道以及 Mall店 的入驻绿通。我们把公司注册、顶层合规、资质壁垒和本土履约死死咬合在一起，为千万级规模的中国大卖提供一条 100% 安全的闭环通道。
            </p>

            <p className="font-medium text-red-200">🛡️敬畏交付：做经得起时间检验的“长期主义者”</p>
            <p>
              在我的管理字典里，“原则”高于一切。我常常告诉团队：“做企业服务，拼到最后是良心。如果做不好客户交代的托付，那是会让人寝食难安的。”
            </p>
            <p>
              作为一个长期主义者，我深知做企业也是在立一块口碑的丰碑。来到泰国，您需要的不只是一纸执照，而是一位能和您背靠背打仗的“本土合伙人”。
            </p>
            <p className="italic text-zinc-200">
              “来到泰国13年了，4次创业，3次归零。时间教会我最宝贵的一课是：财富从来不是掠夺多少金钱，而是积攒了多少认知。10多年的创业路，踩过无数的坑，也正是这些失败的烙印，让我长出了真正的同理心。我知道创业有多难，所以我做企业服务，总是忍不住多替客户想一步、多帮客户看一眼。不为别的，只希望走出国门的兄弟们，能少走我当年走过的弯路。”
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-red-500/70 hover:shadow-[0_14px_32px_rgba(153,27,27,0.28)]">
        <h2 className="text-xl font-semibold text-red-300">合作公司展示</h2>
        <p className="mt-3 text-zinc-300">
          已服务 Shopee/TikTok 卖家、泰国本地品牌与跨境供应链企业，覆盖注册、合规、仓配与运营场景。
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-red-500/70 hover:shadow-[0_14px_32px_rgba(153,27,27,0.28)]">
        <h2 className="text-xl font-semibold text-red-300">公司联系方式</h2>
        <div className="mt-3 space-y-1 text-zinc-300">
          <p>企业邮箱：{CONTACT_INFO.email}</p>
          <p>联系电话：{CONTACT_INFO.phone}</p>
          <p>详细地址：{CONTACT_INFO.address}</p>
        </div>
      </section>
      <FloatingAiChat />
    </div>
  );
}
