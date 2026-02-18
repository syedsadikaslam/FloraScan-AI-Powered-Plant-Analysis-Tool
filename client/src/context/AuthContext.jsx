import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    setUser(decoded); // Or fetch user profile if needed
                    // decode only gives id, iat, exp usually unless we packed more
                    // The backend sends user info on login, but here we sustain it from token?
                    // Actually, let's store user info in localStorage too, or fetch it.
                    // For simplicity, let's fetch profile or just decode what we have.
                    // Let's rely on localStorage "user" data for UI, and token for requests.
                    const storedUser = localStorage.getItem("user");
                    if (storedUser) setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post("/api/auth/login", {
            email,
            password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
    };

    const register = async (name, email, password) => {
        const res = await api.post("/api/auth/register", {
            name,
            email,
            password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
    };

    const googleLoginInfo = async (credential) => {
        const res = await api.post("/api/auth/google", {
            token: credential,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));
        setToken(res.data.token);
        setUser(res.data);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, googleLoginInfo, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
