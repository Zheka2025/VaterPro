"use server";

import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateSql } from '@/ai/flows/generate-sql';
import type { GenerateProductDescriptionInput } from '@/ai/schemas';
import type { GenerateSqlInput } from '@/ai/schemas';
import { initialProducts } from '@/lib/constants';
import type { DBSettings, Product } from '@/lib/types';

const mockDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function connectToDb(settings: DBSettings) {
  await mockDelay(600);
  if (!settings.host || !settings.database) {
    throw new Error("Потрібно вказати host і database");
  }
  if (String(settings.password || "").toLowerCase() === "bad") {
    throw new Error("Помилка автентифікації (невірний пароль)");
  }
  return { 
    ok: true, 
    version: "MySQL 8.0 (demo)", 
    tables: [
      { name: "product", label: "Товари" },
      { name: "category", label: "Категорії" },
      { name: "brand", label: "Бренди" },
      { name: "order", label: "Замовлення" },
    ] 
  };
}

export async function getAiGeneratedDescription(input: GenerateProductDescriptionInput) {
  try {
    const result = await generateProductDescription(input);
    return result.description;
  } catch (error) {
    console.error(error);
    const base = input.name?.trim() || "Товар";
    const cat = input.category ? ` з категорії «${input.category}»` : "";
    return `${base}${cat}: надійна якість, збалансована ціна та продуманий дизайн. Підійде для щоденного використання. Гарантія 12 місяців.`;
  }
}

export async function getAiGeneratedSql(input: GenerateSqlInput) {
   try {
    const result = await generateSql(input);
    return result.sql;
  } catch (error) {
    console.error(error);
    const t = (input.query || "").toLowerCase();
    if (t.includes("product") || t.includes("товар") || t.includes("price"))
      return "SELECT id, name, sku, category, price, stock, status FROM product;";
    if (t.includes("category") || t.includes("категор"))
      return "SELECT id, name, parentId FROM category;";
    return "SELECT 1 as result;";
  }
}

export async function getFirebirdSuggestions(query: string) {
  await mockDelay(200);
  const corpus = [
    "Шуруповерт акумуляторний 18V", "Шуруповерт мережевий 600Вт",
    "Фарба інтерʼєрна біла 10л", "Фарба фасадна 5л",
    "Змішувач для раковини хром", "Розетка подвійна із заземленням",
    "Кутник сталевий 50x50", "Грунтовка універсальна 1л"
  ];
  const q = (query || "").toLowerCase();
  if (!q) return [];
  return corpus.filter((x) => x.toLowerCase().includes(q)).slice(0, 8);
}


// This is a mock function. In a real app, this would query the Interbase DB.
export async function getProductByBarcode(barcode: string): Promise<Partial<Product> | null> {
  await mockDelay(150);
  // Simulate finding a product in the database
  if (barcode === '111222333') {
    return {
      name: "Молоток слюсарний 500г",
      sku: "111222333",
      category: "Ручний інструмент", // Assuming this category exists
      price: 250,
      stock: 1,
    };
  }
  // Simulate finding a product from the initial list for demo
  const found = initialProducts.find(p => p.sku === barcode);
  if (found) {
    return {
        name: found.name,
        sku: found.sku,
        category: found.category,
        price: found.price,
        stock: 1,
    }
  }

  return null;
}
