import { UIProvider } from '../lib/ui-context';
import { AuthProvider } from '../lib/auth-context';
import { Nav } from '../components/Nav';
import { Hero } from '../components/Hero';
import { Presentation } from '../components/Presentation';
import { HistorySection } from '../components/HistorySection';
import { ProgramsDepartments } from '../components/ProgramsDepartments';
import { CoursesSection } from '../components/CoursesSection';
import { FacultySection } from '../components/FacultySection';
import { StatsBand } from '../components/StatsBand';
import { Testimonials } from '../components/Testimonials';
import { EventsSection } from '../components/EventsSection';
import { GallerySection } from '../components/GallerySection';
import { DonationsSection } from '../components/DonationsSection';
import { CertificatesSection } from '../components/CertificatesSection';
import { FAQSection } from '../components/FAQSection';
import { NewsSection } from '../components/NewsSection';
import { ContactSection } from '../components/ContactSection';
import { Footer } from '../components/Footer';
import { Modals, Toast, TopButton } from '../components/Modals';

export default function HomePage() {
  return (
    <AuthProvider>
      <UIProvider>
        <Nav />
        <Hero />
        <Presentation />
        <HistorySection />
        <ProgramsDepartments />
        <CoursesSection />
        <FacultySection />
        <StatsBand />
        <EventsSection />
        <GallerySection />
        <Testimonials />
        <DonationsSection />
        <CertificatesSection />
        <FAQSection />
        <NewsSection />
        <ContactSection />
        <Footer />
        <Modals />
        <Toast />
        <TopButton />
      </UIProvider>
    </AuthProvider>
  );
}
