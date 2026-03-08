import { ServiceDomain } from "@/components/service-domain";
import { getServiceByDomain } from "@/lib/services";

export default async function GovernmentPage() {
  const items = await getServiceByDomain("government");
  return (
    <ServiceDomain
      title="工商财税服务"
      subtitle="聚焦工商注册与税务办理，均包含业务介绍、成功案例与系统登录入口。"
      items={items}
    />
  );
}
