import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function WaterCalculator() {
    const [plantType, setPlantType] = useState("tropical");
    const [potSize, setPotSize] = useState("medium");
    const [sunlight, setSunlight] = useState("indirect");
    const [result, setResult] = useState(null);

    const calculateWatering = () => {
        let days = 7; // Base
        let amount = 250; // Base ml

        // Plant Type Logic
        if (plantType === "succulent") {
            days += 7;
            amount -= 100;
        } else if (plantType === "herb") {
            days -= 3;
        } else if (plantType === "flower") {
            days -= 2;
            amount += 50;
        }

        // Pot Size Logic
        if (potSize === "small") {
            days -= 1; // Dries faster
            amount = 100;
        } else if (potSize === "large") {
            days += 2; // Holds water longer
            amount = 600;
        }

        // Sunlight Logic
        if (sunlight === "direct") {
            days -= 2; // Dries faster
        } else if (sunlight === "low") {
            days += 3; // Dries slower
        }

        // Result string
        setResult({
            freq: days < 2 ? "Every day" : `Every ${days} days`,
            amount: `${amount}ml (approx. ${Math.round(amount / 240)} cups)`
        });
    };

    return (
        <section className="water-calc-container">
            <div className="water-calc-card">
                <div className="calc-header">
                    <div className="icon-box">
                        <i className="fa-solid fa-faucet-drip"></i>
                    </div>
                    <div>
                        <h3>Smart Watering Calculator</h3>
                        <p>Get a custom schedule based on your plant's needs.</p>
                    </div>
                </div>

                <div className="calc-form">
                    <div className="form-group">
                        <label>Plant Type</label>
                        <select value={plantType} onChange={(e) => setPlantType(e.target.value)}>
                            <option value="tropical">Tropical (Monstera, Pothos)</option>
                            <option value="succulent">Succulent / Cactus</option>
                            <option value="herb">Herb (Basil, Mint)</option>
                            <option value="flower">Flowering Plant</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Pot Size</label>
                        <select value={potSize} onChange={(e) => setPotSize(e.target.value)}>
                            <option value="small">Small (Desktop)</option>
                            <option value="medium">Medium (Floor)</option>
                            <option value="large">Large (Tree/Bush)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Sunlight</label>
                        <select value={sunlight} onChange={(e) => setSunlight(e.target.value)}>
                            <option value="low">Low Light</option>
                            <option value="indirect">Bright Indirect</option>
                            <option value="direct">Direct Sun</option>
                        </select>
                    </div>

                    <button onClick={calculateWatering} className="calc-btn">
                        Calculate Schedule
                    </button>
                </div>

                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="calc-result"
                        >
                            <div className="result-item">
                                <i className="fa-regular fa-calendar"></i>
                                <span>{result.freq}</span>
                            </div>
                            <div className="result-item">
                                <i className="fa-solid fa-glass-water"></i>
                                <span>{result.amount}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
