import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeTags, scorePlan } from "@/lib/matching";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const industry = String(body.industry ?? "").trim() || "未填写行业";
  const demands: string[] = Array.isArray(body.demands) ? body.demands.map(String) : [];
  const accessCode = String(body.accessCode ?? "").trim().toUpperCase();
  const customerName = String(body.customerName ?? "").trim();
  const customerCompany = String(body.customerCompany ?? "").trim();
  const customerPhone = String(body.customerPhone ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim();
  const annualRevenue = String(body.annualRevenue ?? "").trim();
  const mallNeed = String(body.mallNeed ?? "").trim();
  const mallNeedCode = String(body.mallNeedCode ?? "").trim();
  const productType = String(body.productType ?? "").trim();
  const productTypeCode = String(body.productTypeCode ?? "").trim();
  const logisticsType = String(body.logisticsType ?? "").trim();
  const logisticsTypeCode = String(body.logisticsTypeCode ?? "").trim();
  const qualificationNeedCode = String(body.qualificationNeedCode ?? "").trim();
  const qualificationMethodCode = String(body.qualificationMethodCode ?? "").trim();
  const visaNeedCode = String(body.visaNeedCode ?? "").trim();
  const visaMethodCode = String(body.visaMethodCode ?? "").trim();
  const invoiceNeedCode = String(body.invoiceNeedCode ?? "").trim();
  const accountOpeningAbility = String(body.accountOpeningAbility ?? "").trim();
  const accountOpeningAbilityCode = String(body.accountOpeningAbilityCode ?? "").trim();
  const supplementaryNote = String(body.supplementaryNote ?? "").trim();

  const needSet = new Set(["4.1", "4.2", "4.3", "4.4", "4.5"]);
  const mallNeedSet = new Set(["1.1", "1.2", "1.3", "1.4", "1.5"]);
  const productTypeSet = new Set(["2.1", "2.2", "2.3"]);
  const logisticsSet = new Set(["3.1", "3.2", "3.3", "3.4"]);
  const methodSet = new Set([".1", ".2", ".3"]);
  const visaNeedSet = new Set(["5.1", "5.2"]);
  const visaMethodSet = new Set([".1", ".2"]);
  const invoiceNeedSet = new Set(["6.1", "6.2"]);
  const accountAbilityCodeSet = new Set(["7.1", "7.2"]);
  const accountAbilitySet = new Set(["可以", "不可以"]);

  const missingReasons: string[] = [];
  if (!accessCode) missingReasons.push("请先完成评估码校验");
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
    return NextResponse.json({ error: missingReasons.join("；") }, { status: 400 });
  }
  if (mallNeedCode && !mallNeedSet.has(mallNeedCode)) {
    return NextResponse.json({ error: "Mall店需求编码不正确" }, { status: 400 });
  }
  if (productTypeCode && !productTypeSet.has(productTypeCode)) {
    return NextResponse.json({ error: "产品类型编码不正确" }, { status: 400 });
  }
  if (logisticsTypeCode && !logisticsSet.has(logisticsTypeCode)) {
    return NextResponse.json({ error: "物流清关编码不正确" }, { status: 400 });
  }

  if (!needSet.has(qualificationNeedCode)) {
    return NextResponse.json({ error: "资质需求选项不正确" }, { status: 400 });
  }
  if (qualificationNeedCode !== "4.5" && !methodSet.has(qualificationMethodCode)) {
    return NextResponse.json({ error: "请选择认证办理方式" }, { status: 400 });
  }
  if (qualificationNeedCode === "4.5" && qualificationMethodCode) {
    return NextResponse.json({ error: "无认证需求时无需选择办理方式" }, { status: 400 });
  }
  if (!visaNeedSet.has(visaNeedCode)) {
    return NextResponse.json({ error: "工作签证需求选项不正确" }, { status: 400 });
  }
  if (visaNeedCode === "5.1" && !visaMethodSet.has(visaMethodCode)) {
    return NextResponse.json({ error: "请选择工作签证挂靠方式" }, { status: 400 });
  }
  if (visaNeedCode === "5.2" && visaMethodCode) {
    return NextResponse.json({ error: "无工作签证需求时无需选择挂靠方式" }, { status: 400 });
  }
  if (!invoiceNeedSet.has(invoiceNeedCode)) {
    return NextResponse.json({ error: "开票需求选项不正确" }, { status: 400 });
  }
  if (!accountAbilitySet.has(accountOpeningAbility)) {
    return NextResponse.json({ error: "开户能力选项不正确" }, { status: 400 });
  }
  if (accountOpeningAbilityCode && !accountAbilityCodeSet.has(accountOpeningAbilityCode)) {
    return NextResponse.json({ error: "开户能力编码不正确" }, { status: 400 });
  }

  const qualificationFinalCode =
    qualificationNeedCode === "4.5"
      ? "4.5"
      : `${qualificationNeedCode}${qualificationMethodCode}`; // e.g. 4.1.1
  const visaFinalCode = visaNeedCode === "5.2" ? "5.2" : `${visaNeedCode}${visaMethodCode}`; // e.g. 5.1.1

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return NextResponse.json({ error: "联系邮箱格式不正确" }, { status: 400 });
  }

  try {
    const data = await prisma.$transaction(async (tx) => {
      const codeRow = await tx.evaluationAccessCode.findUnique({ where: { code: accessCode } });
      if (!codeRow || codeRow.status !== "available") {
        throw new Error("评估码无效或已使用");
      }

      const plans = await tx.solutionPlan.findMany({
        where: { status: "active" },
        orderBy: { updatedAt: "desc" }
      });
      const demandTags = demands.length
        ? demands.map((d: string) => d.trim()).filter(Boolean)
        : [
            mallNeedCode || "",
            productTypeCode || "",
            logisticsTypeCode || "",
            accountOpeningAbilityCode || "",
            mallNeed,
            productType,
            logisticsType,
            qualificationFinalCode,
            visaFinalCode,
            invoiceNeedCode,
            accountOpeningAbility
          ];
      const selectedCodes = [
        mallNeedCode || "",
        productTypeCode || "",
        logisticsTypeCode || "",
        qualificationFinalCode,
        visaFinalCode,
        invoiceNeedCode,
        accountOpeningAbilityCode || ""
      ].filter(Boolean);

      const optionPlans = await tx.questionOptionPlan.findMany({
        where: {
          answerCode: { in: selectedCodes },
          isActive: true
        }
      });
      const optionPlanMap = new Map(optionPlans.map((p) => [p.answerCode, p]));
      const combinedSections = selectedCodes
        .map((code) => optionPlanMap.get(code))
        .filter((row): row is typeof optionPlans[number] => Boolean(row))
        .map((row) => `【${row.answerCode} ${row.answerLabel}】\n${row.content.trim()}`)
        .filter((row) => !row.endsWith("】\n"));
      const combinedContent = combinedSections.length > 0 ? combinedSections.join("\n\n") : null;
      const sorted = plans
        .map((p) => ({ plan: p, score: scorePlan(p, industry, demandTags) }))
        .sort((a, b) => b.score - a.score);
      const best = sorted[0]?.plan ?? null;
      const fallback = `行业：${industry}\n需求：${normalizeTags(demandTags.join(",")).join("、")}\n建议：未命中完整预设方案，建议由顾问进行一对一补充评估。`;
      const content = combinedContent ?? best?.content ?? fallback;

      const useCode = await tx.evaluationAccessCode.updateMany({
        where: { code: accessCode, status: "available" },
        data: { status: "used", usedAt: new Date() }
      });
      if (useCode.count !== 1) {
        throw new Error("评估码已被使用");
      }

      await tx.solutionEvaluation.create({
        data: {
          evaluationCode: accessCode,
          customerName,
          customerCompany,
          customerPhone,
          customerEmail,
          annualRevenue,
          mallNeed,
          productType,
          logisticsType,
          qualificationNeedCode,
          qualificationMethodCode,
          qualificationFinalCode,
          visaNeedCode,
          visaMethodCode,
          visaFinalCode,
          invoiceNeedCode,
          accountOpeningAbility,
          supplementaryNote,
          industry,
          demandTags: demandTags.join(","),
          matchedPlanId: best?.id,
          matchedPlan: best?.title,
          generatedPlanContent: content
        }
      });

      return {
        evaluationCode: accessCode,
        matchedPlanTitle: combinedContent ? "7题组合方案" : best?.title ?? null,
        content
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "匹配失败，请稍后重试" },
      { status: 400 }
    );
  }
}
