import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  brand: string;
  description: string;
  slug: string;
  manual: string;
  images: string[];
}

export interface Category {
  name: string;
  slug: string;
  description: string;
  products: Product[];
}

export interface ProductRating {
  average: number;
  count: number;
}

async function readJson<T>(path: string): Promise<T> {
  const contents = await readFile(resolve(process.cwd(), path), "utf8");
  return JSON.parse(contents) as T;
}

export function getProducts(): Promise<Product[]> {
  return readJson<Product[]>("public/products.json");
}

export function getCategories(): Promise<Category[]> {
  return readJson<Category[]>("public/categories.json");
}

export async function getProductRating(product: Product): Promise<ProductRating> {
  const manualPath = resolve(
    process.cwd(),
    "public",
    product.manual.replace(/^\/+/, ""),
  );
  const manual = await readFile(manualPath, "utf8");
  const reviewsHeading = manual.search(/^## Reviews\s*$/im);
  if (reviewsHeading === -1) {
    throw new Error(`No review section found in ${product.manual}`);
  }
  const reviewsStart = manual.indexOf("\n", reviewsHeading) + 1;
  const remainingManual = manual.slice(reviewsStart);
  const nextHeading = remainingManual.search(/^##\s+/m);
  const reviewSection = nextHeading === -1
    ? remainingManual
    : remainingManual.slice(0, nextHeading);

  const ratings = [...reviewSection.matchAll(/\*\*Rating:\s*\**\s*([0-9]+(?:\.[0-9]+)?)/gi)]
    .map((match) => Number(match[1]))
    .filter((rating) => Number.isFinite(rating) && rating >= 0 && rating <= 5);

  if (ratings.length === 0) {
    throw new Error(`No review ratings found in ${product.manual}`);
  }

  return {
    average: ratings.reduce((total, rating) => total + rating, 0) / ratings.length,
    count: ratings.length,
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
