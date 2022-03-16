import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const socketContext = createContext();

//connect the global socket
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const socket = io(BACKEND_URL);

export function useSocket() {
    return useContext(socketContext);
}

export default function SocketContext({children}) {
    return (
        <socketContext.Provider value={socket}>
            {children}
        </socketContext.Provider>
    )
}
