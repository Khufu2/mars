import { NewsletterForm } from "@/components/NewsletterForm";

export default function BriefingsPage(){
  return <main className="institutionPage">
    <header className="institutionHero"><span className="miniLabel">MARS BRIEFINGS</span><h1>Know what moved before the day gets noisy.</h1><p>Concise intelligence across markets, climate, policy, logistics and trade — designed for people who need the signal, not an endless feed.</p></header>
    <section className="briefingProduct">
      <div><span className="miniLabel">THE MARS BRIEF</span><h2>Morning intelligence</h2><p>The top developments affecting Africa&apos;s food economy, what the numbers mean and what to watch next.</p></div>
      <NewsletterForm />
    </section>
  </main>
}
