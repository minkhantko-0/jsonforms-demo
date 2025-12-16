import { create } from 'zustand';
import defaultSchema from '../data/schema.json';
import defaultUiSchema from '../data/uischema.json';

interface FormStore {
  data: object;
  schema: any;
  uiSchema: any;
  jsonInput: string;
  uiSchemaInput: string;
  setData: (data: object) => void;
  setSchema: (schema: any, updateEditor?: boolean) => void;
  setUiSchema: (uiSchema: any) => void;
  setJsonInput: (jsonInput: string) => void;
  setUiSchemaInput: (uiSchemaInput: string) => void;
  clearData: () => void;
}

export const useFormStore = create<FormStore>(set => ({
  data: {},
  schema: defaultSchema,
  uiSchema: defaultUiSchema,
  jsonInput: JSON.stringify(defaultSchema, null, 2),
  uiSchemaInput: JSON.stringify(defaultUiSchema, null, 2),
  setData: data => set({ data }),
  setSchema: (schema, updateEditor = true) =>
    updateEditor
      ? set({ schema, jsonInput: JSON.stringify(schema, null, 2) })
      : set({ schema }),
  setUiSchema: uiSchema =>
    set({ uiSchema, uiSchemaInput: JSON.stringify(uiSchema, null, 2) }),
  setJsonInput: jsonInput => set({ jsonInput }),
  setUiSchemaInput: uiSchemaInput => set({ uiSchemaInput }),
  clearData: () => set({ data: {} }),
}));
