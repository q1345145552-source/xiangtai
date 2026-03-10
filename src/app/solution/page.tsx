"use client";

import { useState } from "react";

type MatchResult = {
  evaluationCode: string;
  matchedPlanTitle: string | null;
  content: string;
};

const MALL_OPTIONS = ["ShopeeMall", "TKMall", "Lazmall", "以上都是", "没有需求"];
const MALL_NEED_CODES: Record<string, string> = {
  ShopeeMall: "1.1",
  TKMall: "1.2",
  Lazmall: "1.3",
  以上都是: "1.4",
  没有需求: "1.5"
};
const PRODUCT_TYPE_OPTIONS = [
  "普货（不需要办理资质的产品）",
  "涉证货（需要办理FDA/TISI/DLD等资质的产品）",
  "不销售任何产品"
];
const PRODUCT_TYPE_CODES: Record<string, string> = {
  "普货（不需要办理资质的产品）": "2.1",
  "涉证货（需要办理FDA/TISI/DLD等资质的产品）": "2.2",
  不销售任何产品: "2.3"
};
const LOGISTICS_OPTIONS = [
  "正清（产品缴纳关税增值税入境泰国）",
  "灰清（无法提供产品的关单以及税票）",
  "正清以及灰清都有",
  "无物流清关需求"
];
const LOGISTICS_CODES: Record<string, string> = {
  "正清（产品缴纳关税增值税入境泰国）": "3.1",
  "灰清（无法提供产品的关单以及税票）": "3.2",
  正清以及灰清都有: "3.3",
  无物流清关需求: "3.4"
};
const QUALIFICATION_NEED_OPTIONS = [
  { code: "4.1", label: "FDA" },
  { code: "4.2", label: "TISI" },
  { code: "4.3", label: "DLD" },
  { code: "4.4", label: "NBTC" },
  { code: "4.5", label: "无认证需求" }
];
const QUALIFICATION_METHOD_OPTIONS = [
  { code: ".1", label: "挂靠办理" },
  { code: ".2", label: "自有地址真实办理（在泰国有可以认证的实际地址）" },
  { code: ".3", label: "没有地址真实办理（在泰国无可以认证的实际地址）" }
];
const VISA_NEED_OPTIONS = [
  { code: "5.1", label: "是" },
  { code: "5.2", label: "否" }
];
const VISA_METHOD_OPTIONS = [
  { code: ".1", label: "有实际工作地址挂靠" },
  { code: ".2", label: "无实际工作地址挂靠" }
];
const INVOICE_NEED_OPTIONS = [
  { code: "6.1", label: "有" },
  { code: "6.2", label: "无" }
];
const ACCOUNT_OPENING_OPTIONS = ["可以", "不可以"];
const ACCOUNT_OPENING_CODES: Record<string, string> = {
  可以: "7.1",
  不可以: "7.2"
};

export default function SolutionPage() {
  const [accessCode, setAccessCode] = useState("");
  const [verifiedCode, setVerifiedCode] = useState("");
  const [verifyMsg, setVerifyMsg] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");
  const [mallNeed, setMallNeed] = useState("");
  const [productType, setProductType] = useState("");
  const [logisticsType, setLogisticsType] = useState("");
  const [qualificationNeedCode, setQualificationNeedCode] = useState("");
  const [qualificationMethodCode, setQualificationMethodCode] = useState("");
  const [visaNeedCode, setVisaNeedCode] = useState("");
  const [visaMethodCode, setVisaMethodCode] = useState("");
  const [invoiceNeedCode, setInvoiceNeedCode] = useState("");
  const [accountOpeningAbility, setAccountOpeningAbility] = useState("");
  const [supplementaryNote, setSupplementaryNote] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [copyMsg, setCopyMsg] = useState("");

  function optionClass(selected: boolean) {
    return `w-full max-w-md self-center ${selected ? "tag-button-active" : "tag-button"}`;
  }

  async function verifyCode() {
    setVerifying(true);
    setVerifyMsg("");
    setFormError("");
    setResult(null);
    const res = await fetch("/api/solutions/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: accessCode })
    });
    const data = (await res.json()) as { ok?: boolean; code?: string; error?: string };
    if (!res.ok || !data.ok) {
      setVerifiedCode("");
      setVerifyMsg(data.error ?? "评估码校验失败");
      setVerifying(false);
      return;
    }
    setVerifiedCode(data.code ?? accessCode.trim().toUpperCase());
    setVerifyMsg("评估码校验通过，请填写下方问卷。");
    setVerifying(false);
  }

  async function onMatch() {
    setFormError("");
    const missingReasons: string[] = [];
    if (!customerName) missingReasons.push("请填写客户姓名");
    if (!customerCompany) missingReasons.push("请填写客户公司");
    if (!customerPhone) missingReasons.push("请填写联系电话");
    if (!customerEmail) missingReasons.push("请填写联系邮箱");
    if (!annualRevenue) missingReasons.push("请填写年营业额");
    if (!mallNeed) missingReasons.push("请完成第1题 Mall店需求");
    if (!productType) missingReasons.push("请完成第2题 销售的产品类型");
    if (!logisticsType) missingReasons.push("请完成第3题 物流清关");
    if (!qualificationNeedCode) missingReasons.push("请完成第4题 资质需求");
    if (!visaNeedCode) missingReasons.push("请完成第5题 工作签证需求");
    if (!invoiceNeedCode) missingReasons.push("请完成第6题 开票需求");
    if (!accountOpeningAbility) missingReasons.push("请完成第7题 法人是否能来泰国开户");
    if (missingReasons.length > 0) {
      setFormError(`提交失败：${missingReasons.join("；")}`);
      return;
    }
    if (qualificationNeedCode !== "4.5" && !qualificationMethodCode) {
      setFormError("提交失败：第4题已选择资质需求，请继续选择对应办理方式。");
      return;
    }
    if (visaNeedCode === "5.1" && !visaMethodCode) {
      setFormError("提交失败：第5题已选择“是”，请继续选择挂靠方式。");
      return;
    }
    setLoading(true);
    const mallNeedCode = MALL_NEED_CODES[mallNeed] ?? "";
    const productTypeCode = PRODUCT_TYPE_CODES[productType] ?? "";
    const logisticsTypeCode = LOGISTICS_CODES[logisticsType] ?? "";
    const accountOpeningAbilityCode = ACCOUNT_OPENING_CODES[accountOpeningAbility] ?? "";
    const res = await fetch("/api/solutions/match", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessCode: verifiedCode,
        customerName,
        customerCompany,
        customerPhone,
        customerEmail,
        annualRevenue,
        mallNeed,
        mallNeedCode,
        productType,
        productTypeCode,
        logisticsType,
        logisticsTypeCode,
        qualificationNeedCode,
        qualificationMethodCode,
        visaNeedCode,
        visaMethodCode,
        invoiceNeedCode,
        accountOpeningAbility,
        accountOpeningAbilityCode,
        supplementaryNote
      })
    });
    const data = (await res.json()) as MatchResult & { error?: string };
    if (!res.ok) {
      setFormError(data.error ?? "提交失败，请检查问卷内容后重试");
      setLoading(false);
      return;
    }
    setResult(data as MatchResult);
    setFormError("");
    setCopyMsg("");
    setLoading(false);
  }

  async function copyPlanContent() {
    if (!result?.content) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopyMsg("方案内容已复制");
    } catch {
      setCopyMsg("复制失败，请手动复制");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="overflow-hidden rounded-2xl border border-red-900/50 bg-gradient-to-br from-black via-zinc-950 to-red-950 p-0 text-zinc-100 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <div className="border-b border-red-900/40 bg-black/40 px-6 py-4">
          <h1 className="text-2xl font-bold text-red-300">湘泰出海方案评估</h1>
          <p className="mt-1 text-sm text-zinc-300">请先输入管理员提供的评估码，校验通过后再进入正式问卷。</p>
        </div>
        <div className="px-6 py-5">
          <label className="block text-center text-sm font-medium text-zinc-200">评估码</label>
          <div className="mt-2 flex flex-col gap-3 md:flex-row">
            <input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="input-base border-red-900/60 bg-black/40 text-center text-zinc-100 placeholder:text-zinc-500 focus:border-red-500 focus:ring-red-900/30 md:max-w-sm"
              placeholder="例如：EVA-ABCD-4F8K"
            />
            <button
              onClick={verifyCode}
              disabled={verifying}
              className="inline-flex items-center justify-center rounded-lg border border-red-400/50 bg-black/30 px-4 py-2 font-medium text-red-100 transition duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-900/30 hover:text-white active:scale-[0.98]"
            >
              {verifying ? "校验中..." : "校验评估码"}
            </button>
          </div>
          {verifyMsg && (
            <p className={`mt-3 text-center text-sm ${verifiedCode ? "text-emerald-700" : "text-red-600"}`}>{verifyMsg}</p>
          )}
        </div>
      </section>

      {verifiedCode && (
        <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-0 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <div className="border-b border-red-900/40 bg-black/40 px-6 py-4">
            <h2 className="text-xl font-semibold text-red-300">评估问卷</h2>
            <p className="mt-1 text-sm text-zinc-300">当前评估码：{verifiedCode}</p>
          </div>

          <div className="space-y-5 px-6 py-5">
            <section className="rounded-xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-900/70 text-xs font-semibold text-red-200">
                  1
                </span>
                <h3 className="text-base font-semibold">客户信息填写</h3>
                <span className="rounded bg-red-900/40 px-2 py-0.5 text-xs text-red-200">必填</span>
              </div>
              <div className="flex flex-col gap-3">
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-base text-center"
                  placeholder="客户姓名 *"
                />
                <input
                  value={customerCompany}
                  onChange={(e) => setCustomerCompany(e.target.value)}
                  className="input-base text-center"
                  placeholder="客户公司 *"
                />
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="input-base text-center"
                  placeholder="联系电话 *"
                />
                <input
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="input-base text-center"
                  placeholder="联系邮箱 *"
                  type="email"
                />
                <input
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  className="input-base text-center md:col-span-2"
                  placeholder="年营业额 *（示例：300万人民币 / 500万泰铢）"
                />
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-black/30 p-4">
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-900/70 text-xs font-semibold text-red-200">
                  2
                </span>
                <h3 className="text-lg font-semibold">注册需求问卷</h3>
                <span className="rounded bg-red-900/40 px-2 py-0.5 text-xs text-red-200">必填</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">1. Mall店需求</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {MALL_OPTIONS.map((option, idx) => {
                      const selectedOption = mallNeed === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setMallNeed(option)}
                          className={optionClass(selectedOption)}
                        >
                          {`1.${idx + 1} ${option}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">2. 销售的产品类型</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {PRODUCT_TYPE_OPTIONS.map((option, idx) => {
                      const selectedOption = productType === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setProductType(option)}
                          className={optionClass(selectedOption)}
                        >
                          {`2.${idx + 1} ${option}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">3. 物流清关</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {LOGISTICS_OPTIONS.map((option, idx) => {
                      const selectedOption = logisticsType === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setLogisticsType(option)}
                          className={optionClass(selectedOption)}
                        >
                          {`3.${idx + 1} ${option}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">4. 资质需求</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {QUALIFICATION_NEED_OPTIONS.map((option) => {
                      const selectedOption = qualificationNeedCode === option.code;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => {
                            setQualificationNeedCode(option.code);
                            if (option.code === "4.5") {
                              setQualificationMethodCode("");
                            }
                          }}
                          className={optionClass(selectedOption)}
                        >
                          {`${option.code} ${option.label}`}
                        </button>
                      );
                    })}
                  </div>

                  {qualificationNeedCode && qualificationNeedCode !== "4.5" && (
                    <>
                      <p className="mt-4 text-center text-base font-semibold">办理方式（如需认证）：</p>
                      <div className="mt-2 flex flex-col items-center gap-2">
                        {QUALIFICATION_METHOD_OPTIONS.map((option) => {
                          const selectedOption = qualificationMethodCode === option.code;
                          return (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => setQualificationMethodCode(option.code)}
                              className={optionClass(selectedOption)}
                            >
                              {`${option.code} ${option.label}`}
                            </button>
                          );
                        })}
                      </div>
                      {qualificationMethodCode && (
                        <p className="mt-2 text-center text-xs text-zinc-400">当前资质编码：{`${qualificationNeedCode}${qualificationMethodCode}`}</p>
                      )}
                    </>
                  )}
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">5. 工作签证需求</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {VISA_NEED_OPTIONS.map((option) => {
                      const selectedOption = visaNeedCode === option.code;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => {
                            setVisaNeedCode(option.code);
                            if (option.code === "5.2") {
                              setVisaMethodCode("");
                            }
                          }}
                          className={optionClass(selectedOption)}
                        >
                          {`${option.code} ${option.label}`}
                        </button>
                      );
                    })}
                  </div>

                  {visaNeedCode === "5.1" && (
                    <>
                      <p className="mt-4 text-center text-base font-semibold">若选「是」，请选择以下选项：</p>
                      <div className="mt-2 flex flex-col items-center gap-2">
                        {VISA_METHOD_OPTIONS.map((option) => {
                          const selectedOption = visaMethodCode === option.code;
                          return (
                            <button
                              key={option.code}
                              type="button"
                              onClick={() => setVisaMethodCode(option.code)}
                              className={optionClass(selectedOption)}
                            >
                              {`${option.code} ${option.label}`}
                            </button>
                          );
                        })}
                      </div>
                      {visaMethodCode && (
                        <p className="mt-2 text-center text-xs text-zinc-400">当前签证编码：{`${visaNeedCode}${visaMethodCode}`}</p>
                      )}
                    </>
                  )}
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">6. 开票需求</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {INVOICE_NEED_OPTIONS.map((option) => {
                      const selectedOption = invoiceNeedCode === option.code;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => setInvoiceNeedCode(option.code)}
                          className={optionClass(selectedOption)}
                        >
                          {`${option.code} ${option.label}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">7. 法人是否能来泰国开户</p>
                  <div className="mt-2 flex flex-col items-center gap-2">
                    {ACCOUNT_OPENING_OPTIONS.map((option) => {
                      const selectedOption = accountOpeningAbility === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setAccountOpeningAbility(option)}
                          className={optionClass(selectedOption)}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-700 bg-black/35 p-3">
                  <p className="text-center text-base font-semibold">8. 补充说明（选填）</p>
                  <textarea
                    value={supplementaryNote}
                    onChange={(e) => setSupplementaryNote(e.target.value)}
                    className="input-base mt-2 block min-h-24 max-w-md text-center mx-auto"
                    placeholder="其他需求 / 品类 / 计划时间（选填）"
                  />
                </div>
              </div>
            </section>

            <div className="sticky bottom-3 rounded-xl border border-zinc-700 bg-black/75 p-4 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-zinc-300">请确认必填项已完成后再提交问卷。</p>
                <button onClick={onMatch} disabled={loading} className="btn-primary md:min-w-44">
                  {loading ? "提交中..." : "提交评估问卷"}
                </button>
              </div>
              {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}
            </div>

            <section className="rounded-xl border border-red-900/50 bg-black/40 p-4">
              <div className="border-b border-red-900/40 pb-3">
                <h3 className="text-lg font-semibold text-red-300">方案生成框</h3>
                <p className="mt-1 text-sm text-zinc-300">提交评估问卷后，将在此展示根据问卷选项生成的专属方案内容。</p>
              </div>
              {!result ? (
                <p className="pt-4 text-sm text-zinc-300">暂未生成方案，请先完成问卷并点击“提交评估问卷”。</p>
              ) : (
                <div className="pt-4">
                  <p className="text-sm text-zinc-200">评估码：{result.evaluationCode}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-red-400/50 bg-black/30 px-4 py-2 font-medium text-red-100 transition duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-900/30 hover:text-white active:scale-[0.98]"
                      onClick={copyPlanContent}
                    >
                      一键复制方案
                    </button>
                    {copyMsg && <p className="text-sm text-emerald-700">{copyMsg}</p>}
                  </div>
                  <p className="mt-3 whitespace-pre-line rounded-lg border border-zinc-700 bg-black/45 p-4 text-zinc-200">
                    {result.content}
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      )}
    </div>
  );
}
