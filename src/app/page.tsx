import Link from "next/link";
import { CONTACT_INFO } from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="panel-strong p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-100">Xiangtai Global</p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">湘泰出海 · 泰国一站式本土服务平台</h1>
        <p className="mt-3 max-w-3xl text-slate-100/90">
          湘泰国际深耕泰国本土市场，围绕公司注册、财税合规、资质认证、电商运营与物流仓储提供全链路落地服务。
        </p>
        <div className="mt-5 grid max-w-3xl grid-cols-3 gap-3 text-center text-sm md:text-base">
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xl font-semibold md:text-2xl">280+</p>
            <p className="text-slate-100/80">服务品牌/卖家</p>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xl font-semibold md:text-2xl">1,200+</p>
            <p className="text-slate-100/80">本土合作资源</p>
          </div>
          <div className="rounded-lg border border-white/20 bg-white/10 p-3">
            <p className="text-xl font-semibold md:text-2xl">98%</p>
            <p className="text-slate-100/80">项目按期落地</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/solution" className="btn-primary">
            免费评估
          </Link>
          <Link href="/consult" className="btn-secondary border-slate-500/60 bg-white/10 text-white hover:bg-white/20">
            AI 智能咨询
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">公司介绍</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
            <li>公司背景：深耕泰国出海服务，覆盖企业全生命周期。</li>
            <li>创始人背景介绍：具备跨境电商与本地合规双重实战经验。</li>
            <li>合作公司展示：已服务美妆、食品、家居等多行业客户。</li>
            <li>公司综合实力说明：咨询、注册、资质、仓配、物流一体化服务能力。</li>
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">方案评估</h2>
          <p className="mt-3 text-slate-600">核心功能：根据客户需求提供专属评估码，匹配对应方案并支持后续顾问跟进。</p>
          <Link href="/solution" className="btn-primary mt-4">
            立即获取评估码
          </Link>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-xl font-semibold">合作公司展示</h2>
        <p className="mt-3 text-slate-600">
          已服务 Shopee/TikTok 卖家、泰国本地品牌与跨境供应链企业，覆盖注册、合规、仓配与运营场景。
        </p>
      </section>

      <section className="panel p-6">
        <h2 className="text-xl font-semibold">公司联系方式</h2>
        <div className="mt-3 space-y-1 text-slate-600">
          <p>企业邮箱：{CONTACT_INFO.email}</p>
          <p>联系电话：{CONTACT_INFO.phone}</p>
          <p>详细地址：{CONTACT_INFO.address}</p>
        </div>
      </section>
    </div>
  );
}
