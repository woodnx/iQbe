import { paths } from "api/schema";
import { create } from "zustand";

export type FilteringParam =
  paths["/quizzes"]["get"]["parameters"]["query"] & {};

interface FilteringParamsStore {
  filteringParam: FilteringParam;
  updateFilter: (newFilter: FilteringParam) => void;
  resetFilter: () => void;
}

export const useFilteringParam = create<FilteringParamsStore>()((set) => ({
  filteringParam: {
    page: 1,
    maxView: 100,
    seed: undefined,
  },
  updateFilter: (newFilter) =>
    set((state) => ({
      filteringParam: { ...state.filteringParam, ...newFilter },
    })),
  resetFilter: () =>
    set({
      filteringParam: {
        page: 1,
        maxView: 100,
        seed: undefined,
      },
    }),
}));
