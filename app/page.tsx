import Hero from '@/components/Hero'
import About from '@/components/About'
import Episodes from '@/components/Episodes'
import Footer from '@/components/Footer'

export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <About />
      <Episodes />
      <Footer />
    </main>
  )
}
