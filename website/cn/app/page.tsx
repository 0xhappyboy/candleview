import ChartShowcase from "./components/ChartShowcase";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Preview from "./components/Preview";
import TimeShowcase from "./components/TimeShowcase";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Preview />
      <Features />
      <ChartShowcase />
      <TimeShowcase />
      <Footer />
    </div>
  );
}