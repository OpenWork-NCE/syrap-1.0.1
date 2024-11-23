// context/UserContext.tsx

// import React, {
// 	createContext,
// 	ReactNode,
// 	useContext,
// 	useEffect,
// 	useReducer,
// } from "react";
//
// // Define the shape of the state
// interface UserState {
// 	user: string;
// }
//
// // Define action types
// type UserAction =
// 	| { type: "SET_USER"; payload: string }
// 	| { type: "RESET_USER" };
//
// // Define the initial state
// const initialState: UserState = {
// 	user: "",
// };
//
// // Reducer function to handle actions
// function userReducer(
// 	state: UserState,
// 	action: UserAction,
// ): UserState {
// 	switch (action.type) {
// 		case "SET_USER":
// 			return { ...state, user: action.payload };
// 		case "RESET_USER":
// 			return { ...state, user: "" };
// 		default:
// 			return state;
// 	}
// }
//
// // Create the context type
// interface UserContextType extends UserState {
// 	setUser: (user: string) => void;
// 	resetUser: () => void;
// }
//
// // Create the context
// const UserContext = createContext<UserContextType | undefined>(undefined);
//
// // Fetch user data from API
// async function fetchUser() {
// 	try {
// 		const response = await fetch(`/api/cookies/currentuser`);
//
// 		if (!response.ok) {
// 			console.error(
// 				"Failed to fetch user and the response is : ",
// 				response,
// 			);
// 			return "";
// 		}
// 		return await response.json();
// 	} catch (e) {
// 		console.error("Error fetching user", e);
// 		return "";
// 	}
// }
//
// // Provider component
// export const UserProvider: React.FC<{ children: ReactNode }> = ({
// 	children,
// }) => {
// 	const [state, dispatch] = useReducer(userReducer, initialState);
//
// 	// Fetch user on initial load
// 	useEffect(() => {
// 		async function loadUser() {
// 			const user = await fetchUser();
// 			dispatch({ type: "SET_USER", payload: user });
// 		}
// 		loadUser();
// 	}, []);
//
// 	// Dispatch functions to update the context state
// 	const setUser = (user: string) => {
// 		dispatch({ type: "SET_USER", payload: user });
// 	};
//
// 	const resetUser = () => {
// 		dispatch({ type: "RESET_USER" });
// 	};
//
// 	return (
// 		<UserContext.Provider
// 			value={{
// 				user: state.user,
// 				setUser,
// 				resetUser,
// 			}}
// 		>
// 			{children}
// 		</UserContext.Provider>
// 	);
// };
//
// // Custom hook to use the UserContext
// export const useUser = (): UserContextType => {
// 	const context = useContext(UserContext);
// 	if (context === undefined) {
// 		throw new Error("useUser must be used within an UserProvider");
// 	}
// 	return context;
// };

import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useReducer,
} from "react";

// Define the shape of the state
interface User {
	id: string;
	name: string;
	email: string;
}

interface UserState {
	user: User;
}

// Define action types
type UserAction = { type: "SET_USER"; payload: User } | { type: "RESET_USER" };

// Define the initial state
const initialState: UserState = {
	user: { id: "", name: "", email: "" },
};

// Reducer function to handle actions
function userReducer(state: UserState, action: UserAction): UserState {
	switch (action.type) {
		case "SET_USER":
			return { ...state, user: action.payload };
		case "RESET_USER":
			return { ...state, user: { id: "", name: "", email: "" } };
		default:
			return state;
	}
}

// Create the context type
interface UserContextType extends UserState {
	setUser: (user: User) => void;
	resetUser: () => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Fetch user data from API
async function fetchUser() {
	try {
		const response = await fetch(`/api/cookies/currentuser`);
		if (!response.ok) {
			console.error("Failed to fetch user data: ", response);
			return null;
		}
		return await response.json();
	} catch (e) {
		console.error("Error fetching user data", e);
		return null;
	}
}

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(userReducer, initialState);

	// Fetch user on initial load
	useEffect(() => {
		async function loadUser() {
			const user = await fetchUser();
			if (user) {
				dispatch({ type: "SET_USER", payload: user });
			}
		}
		loadUser();
	}, []);

	// Dispatch functions to update the context state
	const setUser = (user: User) => {
		dispatch({ type: "SET_USER", payload: user });
	};

	const resetUser = () => {
		dispatch({ type: "RESET_USER" });
	};

	return (
		<UserContext.Provider
			value={{
				user: state.user,
				setUser,
				resetUser,
			}}
		>
			{children}
		</UserContext.Provider>
	);
};

// Custom hook to use the UserContext
export const useUser = (): UserContextType => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
