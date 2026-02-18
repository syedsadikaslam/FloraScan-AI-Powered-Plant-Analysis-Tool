import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FEATURES = [
  {
    icon: "fa-seedling",
    title: "AI-Based Plant Identification",
    shortDesc: "Accurately identifies plant species using advanced computer vision models.",
    longDesc: "Our advanced AI model has been trained on over 10,000 plant species. Simply upload a photo, and our system analyzes leaf patterns, flower structures, and growth habits to provide an instant and accurate identification. It's like having a botanist in your pocket!"
  },
  {
    icon: "fa-heartbeat",
    title: "Health Condition Detection",
    shortDesc: "Detects plant diseases, nutrient deficiencies, and stress symptoms.",
    longDesc: "Early detection is key to saving your plants. FloraScan scans for visible signs of diseases such as leaf blight, powdery mildew, root rot, and pest infestations. It also identifies nutrient deficiencies like nitrogen or iron triggers, helping you correct issues before they become fatal."
  },
  {
    icon: "fa-leaf",
    title: "Growth Stage Analysis",
    shortDesc: "Determines growth phase and provides stage-specific care guidance.",
    longDesc: "Plants have different needs at different stages of life. Whether your plant is a seedling, in the vegetative stage, or flowering, our tool determines its current phase and provides tailored advice on pruning, repotting, and support structures."
  },
  {
    icon: "fa-sun",
    title: "Sunlight & Water Recommendations",
    shortDesc: "Suggests optimal watering schedules and sunlight exposure.",
    longDesc: "Overwatering is the #1 killer of house plants. We analyze your plant type to recommend the perfect watering schedule (e.g., 'Wait until topsoil is dry'). We also suggest the ideal light conditions, from bright indirect light to full shade, ensuring your plant thrives."
  },
  {
    icon: "fa-flask",
    title: "Soil & Nutrient Insights",
    shortDesc: "Fertilizer and soil improvement recommendations.",
    longDesc: "Understand what lies beneath! We recommend the best soil mix (e.g., well-draining, loamy, or sandy) and the right type of fertilizer (NPK ratios) to boost your plant's growth and immune system."
  },
  {
    icon: "fa-camera",
    title: "Live Camera Support",
    shortDesc: "Capture real-time plant images directly.",
    longDesc: "Don't have a photo ready? Use our built-in camera integration to snap a picture of your plant instantly. Works seamlessly on both desktop webcams and mobile devices for on-the-go analysis."
  },
  {
    icon: "fa-file-pdf",
    title: "Downloadable PDF Reports",
    shortDesc: "Generate structured analysis reports.",
    longDesc: "Need a record? Generate a professional, downloadable PDF report of your plant's analysis. Perfect for gardeners keeping a journal, or for sharing with experts for second opinions. Includes all identified data and care tips."
  },
  {
    icon: "fa-clock",
    title: "Fast & Secure Processing",
    shortDesc: "Optimized backend ensures quick analysis.",
    longDesc: "Time is money. Our optimized backend on Google Cloud ensures your analysis is processed in seconds. Plus, your data is processed securely, respecting your privacy at every step."
  }
];

export default function Features() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <section className="features-section">
      <h2>Powerful Features</h2>
      <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>Click on any feature to learn more details.</p>

      <div className="features">
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className="feature interactable"
            onClick={() => setSelectedFeature(feature)}
          >
            <i className={`fas ${feature.icon} feature-icon`}></i>
            <div>
              <strong>{feature.title}</strong>
              <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#aaa' }}>{feature.shortDesc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFeature(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedFeature(null)}>×</button>

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <i className={`fas ${selectedFeature.icon}`} style={{ fontSize: '48px', color: '#6cff95' }}></i>
              </div>

              <h3 style={{ color: '#fff', marginBottom: '15px' }}>{selectedFeature.title}</h3>
              <p style={{ lineHeight: '1.6', color: '#ddd' }}>{selectedFeature.longDesc}</p>

              <button className="primary-btn" style={{ marginTop: '20px' }} onClick={() => setSelectedFeature(null)}>
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
