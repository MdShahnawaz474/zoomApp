import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
    userData: any; // Define a more specific type here if needed
    setUserData: React.Dispatch<React.SetStateAction<any>>;
    handleLogin: (username: string, password: string) => Promise<any>;
    handleRegister: (name: string, username: string, password: string) => Promise<string>;
};
 export const AuthContext = createContext<AuthContextType>(null!);

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users",
});

// Define the AuthProvider component that will wrap the application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [userData, setUserData] = useState<any>(null); // Initialize user data state
    const router = useNavigate(); // Use navigate hook for routing

    // Handle user registration
    const handleRegister = async (name: string, username: string, password: string) => {
        try {
            const request = await client.post("/register", {
                name,
                username,
                password,
            });

            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    // Handle user login
    const handleLogin = async (username: string, password: string) => {
        try {
            const request = await client.post("/login", {
                username,
                password,
            });

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                setUserData(request.data); // Set the user data after successful login
                router("/home"); // Redirect to home
                return "Login successful!";
            }
        } catch (err) {
            throw err
        }
    };

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode:string) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }

    // Return the context provider with all necessary values
    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    };

    return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};

// Custom hook to use AuthContext easily in any component
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
