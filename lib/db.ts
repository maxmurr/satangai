import Dexie, { type Table } from "dexie";
import { CashFlow, RetirementPlan, TaxCalculation } from "./types";

export class DexieDatabase extends Dexie {
  cashFlows!: Table<CashFlow, string>;
  retirements!: Table<RetirementPlan, string>;
  taxs!: Table<TaxCalculation, string>;

  constructor() {
    super("SatangAI");

    this.version(1).stores({
      cashFlows: "id, createdAt, updatedAt, [createdAt+updatedAt]",

      retirements: "id, userId, createdAt, updatedAt, [userId+createdAt]",

      taxs: "id, userId, year, createdAt, updatedAt, [userId+year], [year+createdAt]",
    });
  }
}

export const db = new DexieDatabase();
