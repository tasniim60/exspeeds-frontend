import { http } from "./apiClient";
import { Customer, AdminStorage } from "@/lib/adminData";

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const data = await http.get<Customer[]>("/api/customers");
    if (data && Array.isArray(data)) {
      AdminStorage.saveCustomers(data);
      return data;
    }
    return AdminStorage.getCustomers();
  },

  async createCustomer(customer: Customer): Promise<Customer> {
    const data = await http.post<Customer>("/api/customers", customer);
    const saved = data || customer;
    const current = AdminStorage.getCustomers();
    AdminStorage.saveCustomers([saved, ...current]);
    return saved;
  },

  async updateCustomer(customer: Customer): Promise<Customer> {
    const data = await http.put<Customer>("/api/customers", customer);
    const saved = data || customer;
    const current = AdminStorage.getCustomers();
    AdminStorage.saveCustomers(current.map((c) => (c.id === saved.id ? saved : c)));
    return saved;
  },

  async deleteCustomer(id: string): Promise<boolean> {
    await http.delete(`/api/customers?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getCustomers();
    AdminStorage.saveCustomers(current.filter((c) => c.id !== id));
    return true;
  },
};

// Backwards compatibility alias
export const CustomerService = customerService;
