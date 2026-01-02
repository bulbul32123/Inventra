import CTA from "@/components/landing/CTA";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Feature";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HomeNavbar } from "@/components/landing/HomeNavbar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import TrustedBy from "@/components/landing/TrustedBy";
import { UIPreview } from "@/components/landing/UIPreview";
import { UseCases } from "@/components/landing/UseCases";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-primary-foreground" id="home">
      <HomeNavbar />
      <main className="flex-1">
        <div className="px-5">
          <Hero />
          <TrustedBy />
          <Features />
          <UIPreview />
          <UseCases />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <FAQ />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
