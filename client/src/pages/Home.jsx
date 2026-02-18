import UploadPanel from "../components/UploadPanel";
import Features from "../components/Features";
import DailyTip from "../components/DailyTip";
import SeasonalCare from "../components/SeasonalCare";
import WaterCalculator from "../components/WaterCalculator";
import MoonPhase from "../components/MoonPhase";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <h1>AI Powered Plant Analysis</h1>
        <p>
          FloraScan uses advanced AI vision to identify plant species, health
          conditions, and provide personalized care recommendations instantly.
        </p>
      </section>

      <UploadPanel />

      <div className="home-widgets-grid">
        <DailyTip />
        <SeasonalCare />
        <MoonPhase />
      </div>

      <WaterCalculator />

      <Features />
    </main>
  );
}
