import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    image: String, // Base64
    result: String,
    date: { type: Date, default: Date.now },
});

export default mongoose.model("Analysis", AnalysisSchema);
