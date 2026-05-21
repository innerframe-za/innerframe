import { MarketingNav } from '@/components/marketing/MarketingNav'
import { Hero } from '@/components/marketing/Hero'
import { WhoWeAre } from '@/components/marketing/WhoWeAre'
import { Pillars } from '@/components/marketing/Pillars'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { WhoItsFor } from '@/components/marketing/WhoItsFor'
import { Pricing } from '@/components/marketing/Pricing'
import { ContactForm } from '@/components/marketing/ContactForm'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'

export default function MarketingPage() {
  return (
    <>
      <MarketingNav />
      <main className="pt-[78px]">
        <Hero />
        <WhoWeAre />
        <Pillars />
        <HowItWorks />
        <WhoItsFor />
        <Pricing />
        <ContactForm />
      </main>
      <MarketingFooter />
    </>
  )
}
