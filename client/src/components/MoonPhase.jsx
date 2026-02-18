import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function MoonPhase() {
    const [phaseData, setPhaseData] = useState(null);

    useEffect(() => {
        // Simple Moon Phase Calculation
        const getMoonPhase = () => {
            let year = new Date().getFullYear();
            let month = new Date().getMonth() + 1;
            const day = new Date().getDate();

            let c = 0;
            let e = 0;
            let jd = 0;
            let b = 0;

            if (month < 3) {
                year--;
                month += 12;
            }

            ++month;

            c = 365.25 * year;
            e = 30.6 * month;
            jd = c + e + day - 694039.09; // jd is total days elapsed
            jd /= 29.5305882; // divide by the moon cycle
            b = parseInt(jd); // int(jd) -> b, take integer part of jd
            jd -= b; // subtract integer part to leave fractional part of original jd
            b = Math.round(jd * 8); // scale fraction from 0-8 and round

            if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0

            switch (b) {
                case 0:
                    return { phase: "New Moon", icon: "🌑", advice: "Best for planting leafy greens & balanced root growth." };
                case 1:
                    return { phase: "Waxing Crescent", icon: "🌒", advice: "Moonlight increases. Good for sowing seeds that grow above ground." };
                case 2:
                    return { phase: "First Quarter", icon: "🌓", advice: "Gravitational pull decreases. Ideally, plant annuals like beans & melons." };
                case 3:
                    return { phase: "Waxing Gibbous", icon: "🌔", advice: "High moisture uptake. Excellent time for transplanting & grafting." };
                case 4:
                    return { phase: "Full Moon", icon: "🌕", advice: "Peak moisture. Best for planting root crops (carrots, potatoes) & bulbs." };
                case 5:
                    return { phase: "Waning Gibbous", icon: "🌖", advice: "Light decreases. Focus on pruning & harvesting fruit to store." };
                case 6:
                    return { phase: "Last Quarter", icon: "🌗", advice: "Sap flow slows down. Perfect for weeding, pest control, & cultivation." };
                case 7:
                    return { phase: "Waning Crescent", icon: "🌘", advice: "Resting period. Harvest, transplant, & fertilize. Avoid planting seeds." };
                default:
                    return { phase: "New Moon", icon: "🌑", advice: "Best for planting leafy greens & balanced root growth." };
            }
        };

        setPhaseData(getMoonPhase());
    }, []);

    if (!phaseData) return null;

    return (
        <section className="moon-phase-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="moon-card"
            >
                <div className="moon-header">
                    <span className="moon-icon">{phaseData.icon}</span>
                    <div>
                        <h3>{phaseData.phase}</h3>
                        <p>Lunar Gardening Guide</p>
                    </div>
                </div>
                <p className="moon-advice">
                    <i className="fa-solid fa-seedling"></i> {phaseData.advice}
                </p>
            </motion.div>
        </section>
    );
}
