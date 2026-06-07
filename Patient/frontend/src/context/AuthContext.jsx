import React from 'react'
const AuthContext = React.createContext(null)
export const AuthProvider = ({children}) => <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>
export default AuthContext
