import { http } from "./apiClient";
import { InternalTransfer, SalaryPayment, AdminStorage } from "@/lib/adminData";

export const treasuryService = {
  // Internal Transfers
  async getInternalTransfers(): Promise<InternalTransfer[]> {
    const data = await http.get<InternalTransfer[]>("/api/internal-transfers");
    if (data && Array.isArray(data)) {
      AdminStorage.saveInternalTransfers(data);
      return data;
    }
    return AdminStorage.getInternalTransfers();
  },

  async createInternalTransfer(transfer: InternalTransfer): Promise<InternalTransfer> {
    const data = await http.post<InternalTransfer>("/api/internal-transfers", transfer);
    const saved = data || transfer;
    const current = AdminStorage.getInternalTransfers();
    AdminStorage.saveInternalTransfers([saved, ...current.filter((t) => t.id !== saved.id)]);
    return saved;
  },

  async deleteInternalTransfer(id: string): Promise<boolean> {
    await http.delete(`/api/internal-transfers?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getInternalTransfers();
    AdminStorage.saveInternalTransfers(current.filter((t) => t.id !== id));
    return true;
  },

  // Salary Payments
  async getSalaries(): Promise<SalaryPayment[]> {
    const data = await http.get<SalaryPayment[]>("/api/salaries");
    if (data && Array.isArray(data)) {
      AdminStorage.saveSalaries(data);
      return data;
    }
    return AdminStorage.getSalaries();
  },

  async createSalary(salary: SalaryPayment): Promise<SalaryPayment> {
    const data = await http.post<SalaryPayment>("/api/salaries", salary);
    const saved = data || salary;
    const current = AdminStorage.getSalaries();
    AdminStorage.saveSalaries([saved, ...current.filter((s) => s.id !== saved.id)]);
    return saved;
  },

  async deleteSalary(id: string): Promise<boolean> {
    await http.delete(`/api/salaries?id=${encodeURIComponent(id)}`);
    const current = AdminStorage.getSalaries();
    AdminStorage.saveSalaries(current.filter((s) => s.id !== id));
    return true;
  },
};

export const TreasuryService = treasuryService;

