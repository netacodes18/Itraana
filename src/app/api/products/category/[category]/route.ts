import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  return NextResponse.json(products);
}
