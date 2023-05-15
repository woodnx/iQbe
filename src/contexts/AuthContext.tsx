import { ReactNode, createContext, useContext, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useLocation, useNavigate,  } from "react-router-dom";
import useUserStore, { FirebaseUser } from "../store/user";

export type AuthContextProps = {
  user: FirebaseUser
}

export type AuthProps = {
  children: ReactNode
}

const AuthContext = createContext<Partial<AuthContextProps>>({})

export const useAuthContext = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }: AuthProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = getAuth()
  const getIdToken = useUserStore((state) => state.getIdToken)

  const requireLogin = 
    location.pathname === '/' ||
    location.pathname === '/search'
  
  useEffect(() => {
    const authStateChanged = onAuthStateChanged(auth, (user) => {
      
      if (!user && requireLogin) navigate('/login')
    })
    getIdToken()
    return () => {
      authStateChanged()
    }
  },[])
  
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}