import { ServiceDomain } from "@/components/service-domain";
import { getServiceByDomain } from "@/lib/services";

export default async function EcommercePage() {
  const items = await getServiceByDomain("ecommerce");
  return (
    <ServiceDomain
      title="电商增值服务"
      subtitle="店铺入驻：展示各平台（如 Shopee/TikTok）入驻价格。客户查阅价格后，需单独联系客服进行下单办理。"
      items={items}
    />
  );
}
