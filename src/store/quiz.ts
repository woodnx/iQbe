import { create } from 'zustand'
import axios from '../plugins/axios'
import { Quiz, QuizRequestParams } from '../types'

export type QuizState = {
  quizzes: Quiz[] | null,
  params: QuizRequestParams,
  getQuiz: (params?: QuizRequestParams) => void,
  changePage: (page: number) => void,
}

async function fetchQuiz (params?: QuizRequestParams) {
  return await axios.get<Quiz[]>('/quizzes', { params }).then(res => res.data)
}
const useQuizzesStore = create<QuizState>((set, get) => ({
  quizzes: null,
  params: { page: 1, maxView: 100 },
  getQuiz: async (params?: QuizRequestParams) => {
    const nowparams = get().params
    const newparams = { ...nowparams, params }

    const quizzes = await fetchQuiz(newparams)
    set({ quizzes, params: newparams })
  },
  changePage: async (page: number) => {
    const nowparams = get().params
    const newparams = {
      ...nowparams, 
      page
    }
    const quizzes = await fetchQuiz(newparams)
    set({ quizzes, params: newparams })
  }
}))

export default useQuizzesStore