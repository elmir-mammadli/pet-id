/**
 * Питомец в представлении владельца (таблица pets).
 */
export type Pet = {
  id: string;
  owner_id: string;
  public_id: string;
  name: string;
  age_years: number | null;
  breed: string | null;
  photo_path: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PetUpdate = Partial<
  Pick<
    Pet,
    "name" | "age_years" | "breed" | "photo_path" | "notes" | "is_active"
  >
>;
