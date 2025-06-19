import { components } from "api/schema";

export type CategoryDTO = components["schemas"]["Category"];

export default interface ICategoryQueryService {
  available(): Promise<CategoryDTO[]>;
  all(): Promise<CategoryDTO[]>;
}
