import { createContext, useContext } from "react";

export const userContext = createContext();

export function useUser() {
    return useContext(userContext);
}

export function UserContext({user, children}) {
    return <userContext.Provider value={user}>
        {children}
    </userContext.Provider>
}