import { useEffect, useState, useContext } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuthContext from "../context/AuthContext";

export default function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token, user } = useContext(AuthContext);

    useEffect(() => {
        fetchHistory();
    }, [token]); // Refetch if token changes

    const fetchHistory = async () => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const res = await api.get("/api/analysis/history", config);
            setHistory(res.data);
        } catch (error) {
            console.error("Error fetching history", error);
            // If 401, clear history (user logged out or invalid)
            if (error.response && error.response.status === 401) {
                setHistory([]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="page-container"
        >
            <div className="hero">
                <h1>Scan History</h1>
                <p>View your past plant analyses</p>
            </div>

            {!user ? (
                <div className="auth-card" style={{ margin: '0 auto' }}>
                    <h2>Please Login</h2>
                    <p>You need to be logged in to view your scan history.</p>
                    <Link to="/login"><button className="primary-btn">Login Now</button></Link>
                </div>
            ) : loading ? (
                <p className="loading-text">Loading history...</p>
            ) : history.length === 0 ? (
                <p className="loading-text">No history found. Try scanning a plant!</p>
            ) : (
                <div className="history-grid">
                    {history.map((item) => (
                        <Link to={`/plant/${item._id}`} key={item._id} className="history-card">
                            <div className="card-image">
                                <img src={item.image} alt="Plant" />
                            </div>
                            <div className="card-content">
                                <span className="card-date">{new Date(item.date).toLocaleDateString()}</span>
                                <h3>{item.result.substring(0, 50)}...</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </motion.main>
    );
}
