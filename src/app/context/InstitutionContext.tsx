// // context/InstitutionContext.tsx
//
// import React, {
// 	createContext,
// 	ReactNode,
// 	useContext,
// 	useEffect,
// 	useReducer,
// } from "react";
//
// // Define the shape of the state
// interface InstitutionState {
// 	institution: string;
// }
//
// // Define action types
// type InstitutionAction =
// 	| { type: "SET_INSTITUTION"; payload: string }
// 	| { type: "RESET_INSTITUTION" };
//
// // Define the initial state
// const initialState: InstitutionState = {
// 	institution: "",
// };
//
// // Reducer function to handle actions
// function institutionReducer(
// 	state: InstitutionState,
// 	action: InstitutionAction,
// ): InstitutionState {
// 	switch (action.type) {
// 		case "SET_INSTITUTION":
// 			return { ...state, institution: action.payload };
// 		case "RESET_INSTITUTION":
// 			return { ...state, institution: "" };
// 		default:
// 			return state;
// 	}
// }
//
// // Create the context type
// interface InstitutionContextType extends InstitutionState {
// 	setInstitution: (institution: string) => void;
// 	resetInstitution: () => void;
// }
//
// // Create the context
// const InstitutionContext = createContext<InstitutionContextType | undefined>(
// 	undefined,
// );
//
// // Fetch institution data from API
// async function fetchInstitution() {
// 	try {
// 		const response = await fetch(`/api/cookies/userinstitution`);
// 		if (!response.ok) {
// 			console.error(
// 				"Failed to fetch institution and the response is : ",
// 				response,
// 			);
// 			return "";
// 		}
// 		return await response.json();
// 	} catch (e) {
// 		console.error("Error fetching institution", e);
// 		return "";
// 	}
// }
//
// // Provider component
// export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({
// 	children,
// }) => {
// 	const [state, dispatch] = useReducer(institutionReducer, initialState);
//
// 	// Fetch institution on initial load
// 	useEffect(() => {
// 		async function loadInstitution() {
// 			const institution = await fetchInstitution();
// 			dispatch({ type: "SET_INSTITUTION", payload: institution });
// 		}
// 		loadInstitution();
// 	}, []);
//
// 	// Dispatch functions to update the context state
// 	const setInstitution = (institution: string) => {
// 		dispatch({ type: "SET_INSTITUTION", payload: institution });
// 	};
//
// 	const resetInstitution = () => {
// 		dispatch({ type: "RESET_INSTITUTION" });
// 	};
//
// 	return (
// 		<InstitutionContext.Provider
// 			value={{
// 				institution: state.institution,
// 				setInstitution,
// 				resetInstitution,
// 			}}
// 		>
// 			{children}
// 		</InstitutionContext.Provider>
// 	);
// };
//
// // Custom hook to use the InstitutionContext
// export const useInstitution = (): InstitutionContextType => {
// 	const context = useContext(InstitutionContext);
// 	if (context === undefined) {
// 		throw new Error(
// 			"useInstitution must be used within an InstitutionProvider",
// 		);
// 	}
// 	return context;
// };

// context/InstitutionContext.tsx

import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useReducer,
} from "react";

// Define the shape of the state with the new structure for institution
interface InstitutionState {
	institution: {
		id: string;
		name: string;
		slug: string;
		model: string;
		code: string;
	};
}

// Define action types
type InstitutionAction =
	| { type: "SET_INSTITUTION"; payload: InstitutionState["institution"] }
	| { type: "RESET_INSTITUTION" };

// Define the initial state with the updated institution structure
const initialState: InstitutionState = {
	institution: {
		id: "",
		name: "",
		slug: "",
		model: "",
		code: "",
	},
};

// Reducer function to handle actions
function institutionReducer(
	state: InstitutionState,
	action: InstitutionAction,
): InstitutionState {
	switch (action.type) {
		case "SET_INSTITUTION":
			return { ...state, institution: action.payload };
		case "RESET_INSTITUTION":
			return { ...state, institution: initialState.institution };
		default:
			return state;
	}
}

// Create the context type
interface InstitutionContextType extends InstitutionState {
	setInstitution: (institution: InstitutionState["institution"]) => void;
	resetInstitution: () => void;
}

// Create the context
const InstitutionContext = createContext<InstitutionContextType | undefined>(
	undefined,
);

// Fetch institution data from API
async function fetchInstitution() {
	try {
		const response = await fetch(`/api/cookies/userinstitution`);
		if (!response.ok) {
			console.error(
				"Failed to fetch institution and the response is : ",
				response,
			);
			return initialState.institution; // Return default institution data if fetch fails
		}
		return await response.json();
	} catch (e) {
		console.error("Error fetching institution", e);
		return initialState.institution; // Return default institution data on error
	}
}

// Provider component
export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(institutionReducer, initialState);

	// Fetch institution on initial load
	useEffect(() => {
		async function loadInstitution() {
			const institution = await fetchInstitution();
			dispatch({ type: "SET_INSTITUTION", payload: institution });
		}
		loadInstitution();
	}, []);

	// Dispatch functions to update the context state
	const setInstitution = (institution: InstitutionState["institution"]) => {
		dispatch({ type: "SET_INSTITUTION", payload: institution });
	};

	const resetInstitution = () => {
		dispatch({ type: "RESET_INSTITUTION" });
	};

	return (
		<InstitutionContext.Provider
			value={{
				institution: state.institution,
				setInstitution,
				resetInstitution,
			}}
		>
			{children}
		</InstitutionContext.Provider>
	);
};

// Custom hook to use the InstitutionContext
export const useInstitution = (): InstitutionContextType => {
	const context = useContext(InstitutionContext);
	if (context === undefined) {
		throw new Error(
			"useInstitution must be used within an InstitutionProvider",
		);
	}
	return context;
};
