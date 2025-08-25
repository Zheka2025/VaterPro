
"use server";

import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateSql } from '@/ai/flows/generate-sql';
import type { GenerateProductDescriptionInput } from '@/ai/schemas';
import type { GenerateSqlInput } from '@/ai/schemas';
import { initialProducts } from '@/lib/constants';
import type { DBSettings, Product } from '@/lib/types';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const mockDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function connectToDb(settings: DBSettings) {
  await mockDelay(600);
  // This is a mock function now.
  return { 
    ok: true, 
    version: "SQLite 3 (demo)", 
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


// This function now queries a real SQLite database file.
export async function getProductByBarcode(barcode: string): Promise<Partial<Product> | null> {
  
  let db = null;
  try {
    const dbPath = path.join(process.cwd(), 'tovar.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY,
    });
    
    // IMPORTANT: Use TRIM() on both the column and the parameter to avoid issues with whitespace.
    // Use CAST to ensure SQLite treats both as TEXT for reliable comparison, especially with long numeric strings.
    const product = await db.get(
      'SELECT NAME, PRODUCT_ID FROM tovar WHERE TRIM(CAST(PRODUCT_ID AS TEXT)) = TRIM(?)',
       [barcode]
    );

    if (product) {
      return {
        name: product.NAME,
        sku: product.PRODUCT_ID,
        price: 0,
        stock: 1,
        // Category will be empty for now as it's not in the tovar table.
        // It can be assigned manually on the bulk-add page.
        category: '', 
      };
    }

    return null;
  } catch (error) {
    console.error("DATABASE_ERROR:", error);
    // We re-throw the error to be caught by the UI layer and inform the user.
    throw new Error("Не вдалося підключитися до бази даних або виконати запит.");
  } finally {
      if(db) {
          await db.close();
      }
  }
}
