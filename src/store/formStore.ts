import { create } from 'zustand';
import defaultSchema from '../data/schema.json';

interface FormStore {
  data: object;
  schema: any;
  jsonInput: string;
  setData: (data: object) => void;
  setSchema: (schema: any) => void;
  setJsonInput: (jsonInput: string) => void;
  clearData: () => void;
}

export const useFormStore = create<FormStore>((set) => ({
  data: {},
  schema: defaultSchema,
  jsonInput: JSON.stringify(defaultSchema, null, 2),
  setData: (data) => set({ data }),
  setSchema: (schema) => set({ schema }),
  setJsonInput: (jsonInput) => set({ jsonInput }),
  clearData: () => set({ data: {} }),
}));
