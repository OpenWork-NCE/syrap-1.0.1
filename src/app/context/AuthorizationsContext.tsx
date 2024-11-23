// context/AuthorizationsContext.tsx

import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useReducer,
} from "react";

// Define the shape of the state
interface AuthorizationsState {
	authorizations: string[];
}

// Define action types
type AuthorizationsAction =
	| { type: "SET_AUTHORIZATIONS"; payload: string[] }
	| { type: "RESET_AUTHORIZATIONS" };

// Define the initial state
const initialState: AuthorizationsState = {
	authorizations: [],
};

// Reducer function to handle actions
function authorizationsReducer(
	state: AuthorizationsState,
	action: AuthorizationsAction,
): AuthorizationsState {
	switch (action.type) {
		case "SET_AUTHORIZATIONS":
			return { ...state, authorizations: action.payload };
		case "RESET_AUTHORIZATIONS":
			return { ...state, authorizations: [] };
		default:
			return state;
	}
}

// Define the context type
interface AuthorizationsContextType extends AuthorizationsState {
	setAuthorizations: (auths: string[]) => void;
	resetAuthorizations: () => void;
}

// Create the context
const AuthorizationsContext = createContext<
	AuthorizationsContextType | undefined
>(undefined);

// Fetch authorizations data from API
async function fetchAuthorizations() {
	try {
		const response = await fetch(`/api/cookies/authorizations`);

		if (!response.ok) {
			console.error(
				"Failed to fetch autorizations and the response is : ",
				response,
			);
			return [];
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching authorizations", error);
		return [];
	}
}

// Provider component
export const AuthorizationsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(authorizationsReducer, initialState);

	// Fetch authorizations on initial load
	useEffect(() => {
		async function loadAuthorizations() {
			const authorizations = await fetchAuthorizations();
			dispatch({ type: "SET_AUTHORIZATIONS", payload: authorizations });
		}
		loadAuthorizations();
	}, []);

	// Dispatch functions to update the context state
	const setAuthorizations = (auths: string[]) => {
		dispatch({ type: "SET_AUTHORIZATIONS", payload: auths });
	};

	const resetAuthorizations = () => {
		dispatch({ type: "RESET_AUTHORIZATIONS" });
	};

	return (
		<AuthorizationsContext.Provider
			value={{
				authorizations: state.authorizations,
				setAuthorizations,
				resetAuthorizations,
			}}
		>
			{children}
		</AuthorizationsContext.Provider>
	);
};

// Custom hook to use the AuthorizationsContext
export const useAuthorizations = (): AuthorizationsContextType => {
	const context = useContext(AuthorizationsContext);
	if (context === undefined) {
		throw new Error(
			"useAuthorizations must be used within an AuthorizationsProvider",
		);
	}
	return context;
};
