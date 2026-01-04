import AIDialog from "./components/AIDialog";
import ChartShowcase from "./components/ChartShowcase";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Preview from "./components/Preview";
import TimeShowcase from "./components/TimeShowcase";
import FloatingNav from "./components/FloatingNav";
import { useEffect } from "react";

export default function HomePage() {
  const sections = [
    { id: "hero", labelKey: "FloatingNav.hero" },
    { id: "preview", labelKey: "FloatingNav.preview" },
    { id: "ai-dialog", labelKey: "FloatingNav.aiDialog" },
    { id: "features", labelKey: "FloatingNav.features" },
    { id: "chart", labelKey: "FloatingNav.chart" },
    { id: "time", labelKey: "FloatingNav.time" },
    { id: "footer", labelKey: "FloatingNav.footer" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <div id="hero">
        <Hero />
      </div>
      <div id="preview">
        <Preview />
      </div>
      <div id="ai-dialog">
        <AIDialog />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="chart">
        <ChartShowcase />
      </div>
      <div id="time">
        <TimeShowcase />
      </div>
      <div id="footer">
        <Footer />
      </div>
      <FloatingNav sections={sections} />
    </div>
  );
}
