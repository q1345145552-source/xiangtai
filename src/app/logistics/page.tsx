import { ServiceDomain } from "@/components/service-domain";
import { getServiceByDomain } from "@/lib/services";

export default async function LogisticsPage() {
  const items = await getServiceByDomain("logistics");
  return (
    <ServiceDomain
      title="仓储与物流服务"
      subtitle="覆盖海外仓入仓、物流合作、正报正清及系统入口。"
      items={items}
    />
  );
}
