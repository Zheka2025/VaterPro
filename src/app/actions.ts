
"use server";

import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateSql } from '@/ai/flows/generate-sql';
import type { GenerateProductDescriptionInput } from '@/ai/schemas';
import type { GenerateSqlInput } from '@/ai/schemas';
import { initialProducts } from '@/lib/constants';
import type { DBSettings, Product } from '@/lib/types';
import mysql from 'mysql2/promise';


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


// This function now queries a real MySQL database.
export async function getProductByBarcode(barcode: string): Promise<Partial<Product> | null> {
  const dbConfig = {
    host: process.env.NEXT_PUBLIC_DB_HOST,
    user: process.env.NEXT_PUBLIC_DB_USER,
    password: process.env.NEXT_PUBLIC_DB_PASSWORD,
    database: process.env.NEXT_PUBLIC_DB_NAME,
    port: Number(process.env.NEXT_PUBLIC_DB_PORT),
  };

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // IMPORTANT: The table is `tovar` and the barcode field is `ID_tovar`.
    // The query finds the product by its barcode.
    const [rows] = await connection.execute(
      'SELECT `NAME`, `ID_tovar`, `PRC`, `REM_KOL` FROM `tovar` WHERE `ID_tovar` = ?',
      [barcode]
    );

    await connection.end();

    const products = rows as any[];
    if (products.length > 0) {
      const product = products[0];
      return {
        name: product.NAME,
        sku: product.ID_tovar,
        price: product.PRC,
        stock: product.REM_KOL,
        // Category will be empty for now as it's not in the tovar table.
        // It can be assigned manually on the bulk-add page.
        category: '', 
      };
    }

    return null;
  } catch (error) {
    console.error("DATABASE_ERROR:", error);
    if (connection) {
      await connection.end();
    }
    // We re-throw the error to be caught by the UI layer and inform the user.
    throw new Error("Не вдалося підключитися до бази даних або виконати запит.");
  }
}
