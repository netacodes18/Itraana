import { NextRequest, NextResponse } from "next/server";
import { products } from "@/data/products";

export async function GET(req: NextRequest) {
  return NextResponse.json(products);
}
