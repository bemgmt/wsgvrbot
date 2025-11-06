"use client"
import Header from "@/components/header"
import Hero from "@/components/hero"
import QuickLinks from "@/components/quick-links"
import About from "@/components/about"
import CTASection from "@/components/cta-section"
import NewsSection from "@/components/news-section"
import Footer from "@/components/footer"
import Chatbot from "@/components/chatbot"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Hero />
      <About />
      <QuickLinks />
      <CTASection />
      <NewsSection />
      <Footer />
      <Chatbot />
    </main>
  )
}
