import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIPS = [
    "🌱 **Watering Tip:** Overwatering is the #1 killer of house plants. Always feel the soil before watering!",
    "☀️ **Light Fact:** Variegated plants (leaves with white/yellow patterns) need more light than solid green ones.",
    "🎵 **Fun Fact:** Some studies suggest that playing classical music can stimulate plant growth!",
    "🍌 **Fertilizer Hack:** Banana peels are rich in potassium. Soak them in water to create a natural fertilizer.",
    "🌵 **Succulent Care:** Succulents prefer 'soak and dry' watering. Water thoroughly, then let the soil dry out completely.",
    "🌿 **Humidity:** Most tropical plants love humidity. Grouping plants together creates a micro-climate of moisture.",
    "🛑 **Pruning:** Deadheading (removing dead flowers) encourages plants to produce more blooms.",
    "☕ **Coffee Grounds:** Acid-loving plants like Azaleas and Ferns love used coffee grounds as a nitrogen boost.",
    "🥶 **Winter Care:** Reduce watering in winter as plants go dormant and need fewer nutrients.",
    "🪴 **Repotting:** Only repot when you see roots coming out of the drainage holes. Plants like being a little cozy!",
    "🚿 **Dusting:** Wipe your plant leaves with a damp cloth. Dust blocks sunlight and reduces photosynthesis.",
    "🐛 **Pest Control:** A mixture of water and a drop of dish soap is a gentle way to wash off aphids and mites.",
    "🥔 **Propagating:** You can grow a whole new pothos plant just by cutting a stem below a node and putting it in water!",
    "🌬️ **Air Quality:** Snake plants and Spider plants are NASA-approved for purifying indoor air.",
    "🥀 **Yellow Leaves:** Yellow leaves often mean overwatering, but can also mean nutrient deficiency. Check the soil moisture first!",
    "🕰️ **Best Time:** The best time to water plants is early morning, so they have water for the day's sun.",
    "🍫 **Chocolate:** Cocoa mulch is toxic to dogs! Use pine or cedar mulch if you have pets.",
    "🪟 **Rotation:** Rotate your plants every week so they grow evenly and don't lean towards the light.",
    "🥚 **Eggshells:** Crushed eggshells add calcium to the soil, which is great for tomatoes and peppers.",
    "🌡️ **Temperature:** Most indoor plants hate drafts. Keep them away from AC vents and heaters."
];

export default function DailyTip() {
    const [tip, setTip] = useState("");

    useEffect(() => {
        // Select a random tip on mount
        const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
        setTip(randomTip);
    }, []);

    return (
        <section className="daily-tip-container">
            <AnimatePresence mode="wait">
                <motion.div
                    key={tip}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="daily-tip-card"
                >
                    <div className="tip-icon">
                        <i className="fa-solid fa-lightbulb"></i>
                    </div>
                    <div className="tip-content">
                        <h3>Daily Plant Wisdom</h3>
                        <ReactMarkdown>{tip}</ReactMarkdown>
                    </div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
}

// Simple internal markdown renderer since we only generally use bold
const ReactMarkdown = ({ children }) => {
    const parts = children.split(/(\*\*.*?\*\*)/g);
    return (
        <p>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} style={{ color: '#6cff95' }}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </p>
    );
};
