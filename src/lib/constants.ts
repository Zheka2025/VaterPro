import type { Product, Category, ProductStatus } from './types';

export const STATUSES: ProductStatus[] = ["Чернетка", "Активний", "Прихований", "Вичерпано"];

export const DEFAULT_CATEGORIES = [
  "Будматеріали",
  "Електроінструмент",
  "Сантехніка",
  "Фарби та лаки",
  "Електрика",
  "Меблева фурнітура",
];

export const initialProducts: Product[] = [
  { id: "P-1001", name: "Шуруповерт акумуляторний 18V", sku: "SRV-18-2A", category: "Електроінструмент", price: 2899, oldPrice: 3299, stock: 24, status: "Активний", images: ["https://placehold.co/600x400.png"], description: "Компактний шуруповерт з 2 акумуляторами та швидким зарядом.", attributes: { потужність: "320 Вт", акум: "2Ah x2", патрон: "10 мм" }, createdAt: "2025-06-30" },
  { id: "P-1002", name: "Фарба інтерʼєрна біла 10л", sku: "PNT-WHT-10", category: "Фарби та лаки", price: 1199, oldPrice: 0, stock: 120, status: "Активний", images: ["https://placehold.co/600x400.png"], description: "Матова, висока криючість, без різкого запаху.", attributes: { обʼєм: "10 л", основа: "акрил" }, createdAt: "2025-07-11" },
  { id: "P-1003", name: "Змішувач для раковини хром", sku: "MIX-CH-01", category: "Сантехніка", price: 799, oldPrice: 899, stock: 8, status: "Прихований", images: ["https://placehold.co/600x400.png"], description: "Класичний дизайн, керамічний картридж 35 мм.", attributes: { матеріал: "латунь", покриття: "хром" }, createdAt: "2025-05-22" },
  { id: "P-1004", name: "Розетка подвійна із заземленням", sku: "EL-DS-45", category: "Електрика", price: 169, oldPrice: 0, stock: 0, status: "Вичерпано", images: ["https://placehold.co/600x400.png"], description: "Монтаж у стандартну підрозетник 68 мм.", attributes: { струм: "16А", напруга: "230В" }, createdAt: "2025-04-02" },
];

export const initialCategories: Category[] = DEFAULT_CATEGORIES.map((name, i) => ({ id: `C-${i + 1}`, name, parentId: null }));

export function createBlankProduct(categories: Category[]): Product {
  const id = `P-${Math.floor(1000 + Math.random() * 9000)}`;
  return { id, name: "", sku: "", category: (categories?.[0]?.name) || DEFAULT_CATEGORIES[0], price: 0, oldPrice: 0, stock: 0, status: "Чернетка", images: [], description: "", attributes: {}, createdAt: new Date().toISOString().slice(0, 10) };
}

export const currency = (v?: number) => new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH" }).format(v || 0);
