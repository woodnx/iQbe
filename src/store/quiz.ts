import { create } from 'zustand'
import axios from '../axios'

export type Quiz = {
  id: number,
  question: string,
  answer: string,
  workbook: string,
  level: string,
  date: Date,
  total: number,
  right: number,
  isFavorite: boolean,
  registerdMylist: number[],
}

export interface QuizRequestParams {
  page?: number,
  maxView?: number,
  seed?: number,
  workbook?: string[],
  level?: string[],
  queWord?: string,
  ansWord?: string,
  start?: string,
  end?: string,
  judgement?: number,
}

export type QuizState = {
  quizzes: Quiz[] | null,
  getQuiz: (params?: QuizRequestParams) => void
}

const useQuizzesStore = create<QuizState>((set) => ({
  quizzes: null,
  getQuiz: async (params) => {
    console.log(params)
    const quizzes = await axios.get<Quiz[]>('/quizzes/8', { params }).then(res => res.data)
    set({ quizzes })
  }
}))

export default useQuizzesStore