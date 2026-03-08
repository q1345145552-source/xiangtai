import { NextRequest, NextResponse } from "next/server";
import { getServiceByDomain } from "@/lib/services";

type Params = {
  params: Promise<{ domain: string }>;
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { domain } = await params;
  const list = await getServiceByDomain(domain);
  return NextResponse.json(list);
}
