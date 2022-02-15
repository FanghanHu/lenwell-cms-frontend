import { createContext, useContext } from "react";

export const mapContext = createContext();

export function useMap() {
    return useContext(mapContext);
}

export default function MapContext({map, children}) {
    return <mapContext.Provider value={map}>
        {children}
    </mapContext.Provider>
}