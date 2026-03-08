import { prisma } from "@/lib/prisma";
import { SERVICE_DOMAINS } from "@/lib/constants";

export async function getServiceByDomain(domain: string) {
  const rows = await prisma.servicePage.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });

  const filtered = rows.filter((row) => {
    if (domain === "government") {
      return row.domain === "government" && row.slug !== "product-qualification";
    }
    if (domain === "qualification") {
      // Compatible with legacy seeded data where product-qualification was under government.
      return row.domain === "qualification" || row.slug === "product-qualification";
    }
    return row.domain === domain;
  });

  if (filtered.length > 0) {
    return filtered;
  }
  return SERVICE_DOMAINS.filter((s) => s.domain === domain).map((s, idx) => ({
    ...s,
    id: `${domain}-${idx}`,
    sortOrder: idx,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}
