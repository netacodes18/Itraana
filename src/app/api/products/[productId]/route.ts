import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const product = products.find((p) => p.id === Number(productId));
  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
