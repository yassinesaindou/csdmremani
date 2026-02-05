export interface InventoryItem {
  itemId: number;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  quantity: number | null;
  usedQuantity: number | null;
  itemName: string | null;
}

export interface CreateInventoryItemFormData {
  itemName: string;
  quantity: number;
}

export interface UpdateInventoryItemFormData {
  itemName?: string;
  quantity?: number;
}

export interface UseInventoryFormData {
  quantityToUse: number;
}