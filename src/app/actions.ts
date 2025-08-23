
"use server";

import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { generateSql } from '@/ai/flows/generate-sql';
import type { GenerateProductDescriptionInput } from '@/ai/schemas';
import type { GenerateSqlInput } from '@/ai/schemas';
import { initialProducts } from '@/lib/constants';
import type { DBSettings, Product, InterbaseProduct } from '@/lib/types';
import * as firebird from 'node-firebird';

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

/**
 * Get a product from the Interbase GDB file.
 * This function contains the REAL code to connect to Firebird.
 * You need to uncomment it and provide the correct path to your SKLAD.GDB file.
 */
export async function getProductFromInterbase(barcode: string): Promise<InterbaseProduct | null> {
  // --- REAL FIREBIRD CONNECTION CODE ---
  // Uncomment the block below and set the correct path to your .GDB file.
  
  /*
  const options: firebird.Options = {};
  options.host = '127.0.0.1'; // Or your server IP
  options.port = 3050; // Default Firebird port
  options.database = '/path/to/your/SKLAD.GDB'; // IMPORTANT: Use absolute path to your DB file
  options.user = 'SYSDBA'; // Default user
  options.password = 'masterkey'; // Default password
  options.lowercase_keys = false; 
  options.role = null; 
  options.pageSize = 4096; 

  return new Promise((resolve, reject) => {
    firebird.attach(options, function(err, db) {
      if (err) {
        console.error("Firebird connection error:", err);
        // The error might contain sensitive info, so return a generic message
        return reject(new Error("Failed to connect to the database. Check connection settings and if the Firebird server is running."));
      }

      // Query the TOVAR table for a product with the given ID (barcode)
      db.query('SELECT ID, NAME, PRC, REM_KOL FROM TOVAR WHERE ID = ?', [barcode], function(err, result) {
        db.detach(); // Always detach from the database
        
        if (err) {
          console.error("Firebird query error:", err);
          return reject(new Error("Failed to execute query on the database."));
        }
        
        if (result && result.length > 0) {
           // Firebird driver returns data in a specific format, we need to decode it
          const product: InterbaseProduct = {
              ID: result[0].ID.toString(),
              NAME: result[0].NAME.toString(),
              PRC: parseFloat(result[0].PRC),
              REM_KOL: parseInt(result[0].REM_KOL, 10)
          };
          resolve(product);
        } else {
          resolve(null); // No product found
        }
      });
    });
  });
  */

  // --- MOCK DATA FOR DEMO (safe to remove when you uncomment the real code) ---
  await mockDelay(400); // Simulate network latency
  const mockDatabase: { [key: string]: InterbaseProduct } = {
    '2000000012345': { ID: '2000000012345', NAME: 'Цвяхи будівельні 100мм (кг)', PRC: 80, REM_KOL: 50 },
    '2000000054321': { ID: '2000000054321', NAME: 'Шпаклівка фінішна Acryl-Putz 5кг', PRC: 450, REM_KOL: 15 },
    '4820012345678': { ID: '4820012345678', NAME: 'Лампа LED 10W E27', PRC: 65, REM_KOL: 150 },
  };

  if (mockDatabase[barcode]) {
    return mockDatabase[barcode];
  }

  return null;
}
