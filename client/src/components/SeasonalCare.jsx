import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function SeasonalCare() {
    const [seasonData, setSeasonData] = useState(null);

    useEffect(() => {
        const month = new Date().getMonth(); // 0-11
        let season = "";
        let icon = "";
        let advice = [];
        let color = "";

        // Northern Hemisphere Seasons (Simple Approximation)
        if (month >= 2 && month <= 4) {
            season = "Spring";
            icon = "fa-cloud-sun";
            color = "#6cff95"; // Green
            advice = [
                "Repot plants that have outgrown their pots.",
                "Start fertilizing as new growth appears.",
                "Prune dead leaves to encourage fresh blooms."
            ];
        } else if (month >= 5 && month <= 7) {
            season = "Summer";
            icon = "fa-sun";
            color = "#f1c40f"; // Yellow
            advice = [
                "Water more frequently, especially on hot days.",
                "Shield sensitive plants from harsh midday sun.",
                "Mist tropical plants to increase humidity."
            ];
        } else if (month >= 8 && month <= 9) {
            season = "Monsoon / Late Summer";
            icon = "fa-cloud-showers-heavy";
            color = "#3498db"; // Blue
            advice = [
                "Check for fungal infections due to high humidity.",
                "Ensure pots have good drainage to prevent root rot.",
                "Collect rainwater for your plants!"
            ];
        } else if (month >= 10 && month <= 11) {
            season = "Autumn";
            icon = "fa-leaf";
            color = "#e67e22"; // Orange
            advice = [
                "Bring sensitive outdoor plants inside.",
                "Reduce watering as growth slows down.",
                "Stop fertilizing to let plants prepare for dormancy."
            ];
        } else {
            season = "Winter";
            icon = "fa-snowflake";
            color = "#ecf0f1"; // White/Ice
            advice = [
                "Water sparingly; let soil dry out completely.",
                "Keep plants away from cold drafts and heaters.",
                "Dust leaves to maximize limited sunlight absorption."
            ];
        }

        setSeasonData({ season, icon, advice, color });
    }, []);

    if (!seasonData) return null;

    return (
        <section className="seasonal-care-container">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="seasonal-card"
                style={{ borderLeft: `4px solid ${seasonData.color}` }}
            >
                <div className="season-header">
                    <div className="season-icon-box" style={{ background: `${seasonData.color}20` }}>
                        <i className={`fa-solid ${seasonData.icon}`} style={{ color: seasonData.color }}></i>
                    </div>
                    <div>
                        <h3>Current Season: <span style={{ color: seasonData.color }}>{seasonData.season}</span></h3>
                        <p className="subtitle">Seasonal Care Guide</p>
                    </div>
                </div>

                <ul className="season-tips">
                    {seasonData.advice.map((tip, index) => (
                        <li key={index}>
                            <i className="fa-solid fa-check" style={{ color: seasonData.color }}></i> {tip}
                        </li>
                    ))}
                </ul>
            </motion.div>
        </section>
    );
}
