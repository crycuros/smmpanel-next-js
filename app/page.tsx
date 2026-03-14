import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Services } from "@/components/services"
import { Works } from "@/components/works"
import { Testimonials } from "@/components/testimonials"
import { Tutorial } from "@/components/tutorial"
import { TechMarquee } from "@/components/tech-marquee"
import { Footer } from "@/components/footer"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScroll } from "@/components/smooth-scroll"
import { SectionBlend } from "@/components/section-blend"

export default function Home() {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <SectionBlend />
        <About />
        <Services />
        <Works />
        <Testimonials />
        <Tutorial />
        <TechMarquee />
        <Footer />
      </main>
    </SmoothScroll>
  )
}
