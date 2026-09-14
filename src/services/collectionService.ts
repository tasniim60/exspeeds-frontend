import { http } from "./apiClient";
import { CustomerCollection, AdminStorage } from "@/lib/adminData";

export const collectionService = {
  async getCollections(): Promise<CustomerCollection[]> {
    const data = await http.get<CustomerCollection[]>("/api/collections");
    if (data && Array.isArray(data)) {
      AdminStorage.saveCollections(data);
      return data;
    }
    return AdminStorage.getCollections();
  },

  async createCollection(collection: CustomerCollection): Promise<CustomerCollection> {
    const data = await http.post<CustomerCollection>("/api/collections", collection);
    const saved = data || collection;
    const current = AdminStorage.getCollections();
    AdminStorage.saveCollections([saved, ...current.filter((c) => c.id !== saved.id)]);
    return saved;
  },

  async deleteCollection(id: string): Promise<boolean> {
    await http.delete(`/api/collections?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getCollections();
    AdminStorage.saveCollections(current.filter((c) => c.id !== id));
    return true;
  },
};

export const CollectionService = collectionService;

