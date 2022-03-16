import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const userContext = createContext();
export const usersContext = createContext();

export function useUser() {
	return useContext(userContext);
}

export function useUsers() {
	return useContext(usersContext);
}

export function UserContext({ user, children }) {
	const [users, setUsers] = useState([]);

	useEffect(() => {
		//get a list of users
		const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
		axios
			.get(`${BACKEND_URL}/users`)
			.then((res) => {
				setUsers(res.data);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	return (
		<usersContext.Provider value={users}>
			<userContext.Provider value={user}>
                {children}
            </userContext.Provider>
		</usersContext.Provider>
	);
}
