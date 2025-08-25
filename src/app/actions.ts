
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
      { name: "banner", label: "Banner" },
      { name: "brand", label: "Бренд" },
      { name: "brand_categories", label: "Категорії бренду" },
      { name: "category", label: "Категорія" },
      { name: "product", label: "Товари" },
      { name: "promotional_product", label: "Промо-товари" },
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


// This is a mock function. In a real app, this would query the MySQL `tovar` table.
export async function getProductByBarcode(barcode: string): Promise<Partial<Product> | null> {
  await mockDelay(150);

  // In a real application, here you would connect to MySQL and query the `TOVAR` table.
  // Example: SELECT NAME, PRC FROM TOVAR WHERE ID = ?
  // For now, we use a mock database.
  
  const mockDatabase: { [key: string]: Partial<Product> } = {
    '2000000012345': { name: 'Цвяхи будівельні 100мм (кг)', price: 80, stock: 50 },
    '2000000054321': { name: 'Шпаклівка фінішна Acryl-Putz 5кг', price: 450, stock: 15 },
    '4820012345678': { name: 'Лампа LED 10W E27', price: 65, stock: 150 },
    '111222333': { name: "Молоток слюсарний 500г", category: "Ручний інструмент", price: 250, stock: 1 },
  };

  const foundProduct = mockDatabase[barcode];

  if (foundProduct) {
    return {
      ...foundProduct,
      sku: barcode, // The barcode is the SKU
    };
  }

  // Also check initialProducts for demo purposes
  const foundInInitial = initialProducts.find(p => p.sku === barcode);
  if (foundInInitial) {
    return {
        name: foundInInitial.name,
        sku: foundInInitial.sku,
        category: foundInInitial.category,
        price: foundInInitial.price,
        stock: 1,
    }
  }

  return null;
}
