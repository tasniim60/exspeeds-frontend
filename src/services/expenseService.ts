import { http } from "./apiClient";
import { BusinessExpense, AdminStorage } from "@/lib/adminData";

export const expenseService = {
  async getExpenses(): Promise<BusinessExpense[]> {
    const data = await http.get<BusinessExpense[]>("/api/expenses");
    if (data && Array.isArray(data)) {
      AdminStorage.saveExpenses(data);
      return data;
    }
    return AdminStorage.getExpenses();
  },

  async createExpense(item: BusinessExpense): Promise<BusinessExpense> {
    const data = await http.post<BusinessExpense>("/api/expenses", item);
    const saved = data || item;
    const current = AdminStorage.getExpenses();
    AdminStorage.saveExpenses([saved, ...current.filter((e) => e.id !== saved.id)]);
    return saved;
  },

  async deleteExpense(id: string): Promise<boolean> {
    await http.delete(`/api/expenses?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getExpenses();
    AdminStorage.saveExpenses(current.filter((e) => e.id !== id));
    return true;
  },
};

export const ExpenseService = expenseService;

