export const DOCUMENT_TYPES = [
  "vet",
  "vaccine",
  "insurance",
  "other",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export type Document = {
  id: string;
  pet_id: string;
  owner_id: string;
  type: DocumentType;
  file_path: string;
  created_at: string;
};
