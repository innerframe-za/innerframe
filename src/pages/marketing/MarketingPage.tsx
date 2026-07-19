import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { About } from '@/components/marketing/About'
import { Services } from '@/components/marketing/Services'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { StatsSection } from '@/components/marketing/StatsSection'
import { ContactSection } from '@/components/marketing/ContactSection'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export default function MarketingPage() {
  return (
    <>
      <MarketingNav />
      <main className="pt-[72px]">
        <Hero />
        <About />
        <Services />
        <HowItWorks />
        <StatsSection />
        <ContactSection />
      </main>
      <MarketingFooter />
    </>
  )
}
