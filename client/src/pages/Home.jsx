import UploadPanel from "../components/UploadPanel";
import Features from "../components/Features";

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

      <Features />
    </main>
  );
}
