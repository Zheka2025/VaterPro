export type ProductAttribute = {
  [key: string]: string | number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  oldPrice: number;
  stock: number;
  status: ProductStatus;
  images: string[];
  description: string;
  attributes: ProductAttribute;
  createdAt: string;
};

export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export type ProductStatus = "Чернетка" | "Активний" | "Прихований" | "Вичерпано";

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export type ConnectionState = {
  status: ConnectionStatus;
  message: string;
};

export type DBSettings = {
  host: string;
  port: number;
  username: string;
  password?: string;
  database: string;
  azureConnString?: string;
};

export type DBTable = {
  name: string;
  label: string;
};

export type SortState = {
  by: keyof Product | 'createdAt';
  dir: 'asc' | 'desc';
};

// Represents a product from the Interbase/Firebird database file (SKLAD.GDB)
export type InterbaseProduct = {
    ID: string;
    NAME: string;
    PRC: number;
    REM_KOL: number;
    // Add other fields from TOVAR table if needed
};
