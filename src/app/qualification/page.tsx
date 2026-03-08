import { ServiceDomain } from "@/components/service-domain";
import { getServiceByDomain } from "@/lib/services";

export default async function QualificationPage() {
  const items = await getServiceByDomain("qualification");
  return (
    <ServiceDomain
      title="产品资质服务"
      subtitle="独立展示 FDA、DLD 等资质办理内容、成功案例与系统入口。"
      items={items}
    />
  );
}
