import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Clock, Send } from "lucide-react"
import { LandingNav } from "../components/LandingNav"
import { LandingFooter } from "../components/LandingFooter"

const CONTACT_EMAIL = "kyell@kraftstories.com"

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=TaskFlow Inquiry from ${encodeURIComponent(name || "a visitor")}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.location.href = mailtoHref
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-violet-600 opacity-[0.07] blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-4"
          >
            Get in touch
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-black tracking-tight"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Let&rsquo;s Talk
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="mt-5 text-lg text-slate-400"
          >
            Have a question, idea, or just want to say hello? We&rsquo;d love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* ── Form + Info ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact form — 3 cols */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6" noValidate>
              <motion.div variants={fadeUp}>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith…"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-colors duration-200"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <label htmlFor="contact-email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com…"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-colors duration-200"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind…"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:border-violet-500 transition-colors duration-200"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors duration-200 shadow-lg shadow-violet-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d1f]"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Send Message
                </button>
                <p className="text-xs text-slate-600 text-center mt-3">
                  This will open your email client with the message pre-filled.
                </p>
              </motion.div>
            </form>
          </motion.div>

          {/* Info — 2 cols */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div className="glass rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-violet-400" aria-hidden="true" />
              </div>
              <h3 className="text-white font-semibold mb-2">Email us directly</h3>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-violet-400 hover:text-violet-300 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
              >
                {CONTACT_EMAIL}
              </a>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-violet-400" aria-hidden="true" />
              </div>
              <h3 className="text-white font-semibold mb-2">Response time</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We aim to respond to all messages within 1&ndash;2 business days. For urgent
                issues, email us directly.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-violet-900/20 to-transparent">
              <p className="text-slate-300 text-sm leading-relaxed">
                &ldquo;We read every message and take feedback seriously. Your input shapes
                what TaskFlow becomes next.&rdquo;
              </p>
              <p className="text-violet-400 text-xs font-medium mt-3">— The TaskFlow Team</p>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
