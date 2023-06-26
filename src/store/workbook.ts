import { create } from "zustand"
import axios from "../axios"

export type Workbook = {
  id: number,
  label: string,
  color: string,
}

export type WorkbookState = {
  workbooks: Workbook[] | null,
  getWorkbook: () => void
}

const useWorkbookStore = create<WorkbookState>((set) => ({
  workbooks: null,
  getWorkbook: async () => {
    const workbooks = await axios('/workbooks/color').then(res => res.data)
    set({ workbooks })
  }
}))

export default useWorkbookStore