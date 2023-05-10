import { ReactNode, createContext, useContext, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { useLocation, useNavigate,  } from "react-router-dom";
import { useAtom } from "jotai";
import { FirebaseUser, fireBaseUserAtom } from "../atoms";

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
  const [ firebaseUser, setFirebaseUser ] = useAtom(fireBaseUserAtom)

  const requireLogin = 
    location.pathname === '/' ||
    location.pathname === '/search'
  
  useEffect(() => {
    const authStateChanged = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user)
      if (!user && requireLogin) navigate('/login')
    })
    return () => {
      authStateChanged()
    }
  },[])
  
  return (
    <AuthContext.Provider value={{user: firebaseUser}}>
      {children}
    </AuthContext.Provider>
  )
}