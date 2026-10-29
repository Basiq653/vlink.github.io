import HeroSection from '../sections/HeroSection';
import FeaturesSection from '../sections/FeaturesSection';
import FAQSection from '../sections/FAQSection';
import CTASection from '../sections/CTASection';
import AmbientOrbs from '../components/AmbientOrbs';
import type { AuthMode } from '../types';

const Divider = () => (
  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />
);

export default function HomePage({ onAuthOpen }: { onAuthOpen: (mode: AuthMode) => void }) {
  return (
    <>
      <AmbientOrbs />
      <HeroSection onAuthOpen={onAuthOpen} />
      <Divider />
      <FeaturesSection />
      <Divider />
      <FAQSection />
      <CTASection onAuthOpen={onAuthOpen} />
    </>
  );
}
