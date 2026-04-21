import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Heart, Rocket, Users } from "lucide-react"
import { LandingNav } from "../components/LandingNav"
import { LandingFooter } from "../components/LandingFooter"

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

const values = [
  {
    icon: Rocket,
    title: "Velocity",
    body: "We believe slow tools cost more than people think. Everything we build is optimized for speed — in the UI, in the API, and in the workflow.",
  },
  {
    icon: Heart,
    title: "Transparency",
    body: "No black boxes. Activity feeds, audit logs, and open communication are baked into the product from day one.",
  },
  {
    icon: Users,
    title: "Collaboration",
    body: "Great work is never done alone. TaskFlow is designed around teams — permissions, invitations, and real-time sync all included.",
  },
]

const stack = [
  { label: "Frontend", items: "React, TypeScript, Tailwind CSS, Framer Motion" },
  { label: "Backend", items: "Laravel (PHP), RESTful API, Sanctum auth" },
  { label: "Database", items: "MySQL, query optimization, real-time SSE events" },
  { label: "Infra", items: "Railway (backend), Vercel (frontend)" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-violet-600 opacity-[0.07] blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-4"
          >
            About TaskFlow
          </motion.p>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="text-5xl sm:text-6xl font-black tracking-tight leading-tight"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Built for teams that{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              ship fast
            </span>
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="mt-6 text-lg text-slate-400 leading-relaxed"
          >
            TaskFlow started with a simple question: why do project management tools
            feel heavier than the actual work? We set out to build something different —
            fast, focused, and genuinely enjoyable to use.
          </motion.p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]" aria-labelledby="mission-heading">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Our mission
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="mission-heading"
              className="text-4xl font-bold text-white mb-6"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Remove friction from team workflows
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 leading-relaxed mb-4">
              Too many teams are held back by tools that require more overhead than the
              actual work. Endless configuration, slow load times, and cluttered UIs eat
              into the time you should be spending building.
            </motion.p>
            <motion.p variants={fadeUp} className="text-slate-400 leading-relaxed">
              TaskFlow is minimal where it counts, and powerful where it matters. Kanban
              boards, real-time collaboration, role-based permissions — everything a
              modern team needs, with nothing extra to slow you down.
            </motion.p>
          </motion.div>

          {/* Decorative grid visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            aria-hidden="true"
          >
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                  style={{ opacity: 0.4 + (i % 3) * 0.2 }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-transparent rounded-2xl" />
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]" aria-labelledby="values-heading">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              What we stand for
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="values-heading"
              className="text-4xl font-bold text-white"
            >
              Our values
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeUp}
                className="glass rounded-2xl p-8 hover:border-violet-500/30 transition-colors duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-violet-600/20 flex items-center justify-center mb-5 group-hover:bg-violet-600/30 transition-colors">
                  <v.icon className="h-5 w-5 text-violet-400" aria-hidden="true" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-3">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]" aria-labelledby="stack-heading">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Under the hood
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="stack-heading"
              className="text-4xl font-bold text-white"
            >
              Built with modern tools
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {stack.map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="glass rounded-xl p-5">
                <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest block mb-2">
                  {s.label}
                </span>
                <p className="text-slate-300 text-sm">{s.items}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl font-bold text-white mb-6" style={{ textWrap: "balance" } as React.CSSProperties}>
            Ready to get started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors duration-200 shadow-lg shadow-violet-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  )
}
