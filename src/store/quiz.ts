import { create } from 'zustand'
import axios from '../axios'
import { AxiosRequestConfig } from 'axios'

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

export type QuizRequestParams = {
  page: number,
  maxView: number,
  seed: number,
  workbooks: number[],
  levels: number[],
  queWord: string,
  ansWord: string,
  start?: string,
  end?: string,
  judgement?: string,
}

export type QuizState = {
  quizzes: Quiz[] | null,
  getQuiz: (params?: AxiosRequestConfig<QuizRequestParams>) => void
}

const useQuizzesStore = create<QuizState>((set) => ({
  quizzes: null,
  getQuiz: async (params) => {
    const quizzes = await axios.get<Quiz[]>('/quizzes/8', params).then(res => res.data)
    set({ quizzes })
  }
}))

export default useQuizzesStore