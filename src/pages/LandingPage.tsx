import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Kanban, Users, Zap, GripVertical, ShieldCheck, Activity } from "lucide-react"
import { LandingNav } from "../components/LandingNav"
import { LandingFooter } from "../components/LandingFooter"

/* ── Animation variants ── */
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

/* ── Feature cards data ── */
const features = [
  {
    icon: Kanban,
    title: "Kanban Boards",
    description: "Visualize your workflow with flexible boards. Move tasks across columns with simple drag & drop.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite your team, assign roles, and work together in real time — no meeting required.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Every change propagates instantly across all connected clients. Stay in sync, always.",
  },
  {
    icon: GripVertical,
    title: "Drag & Drop",
    description: "Reorder tasks and columns intuitively. Works on desktop and touch devices alike.",
  },
  {
    icon: ShieldCheck,
    title: "Role Permissions",
    description: "Fine-grained access control. Grant view, edit, or admin rights per team member per board.",
  },
  {
    icon: Activity,
    title: "Activity Feed",
    description: "A full audit trail of every action on every board. Know exactly what changed and when.",
  },
]

/* ── How it works steps ── */
const steps = [
  { number: "01", title: "Create a Board", body: "Set up a board in seconds. Name it, pick your columns, and you're ready to go." },
  { number: "02", title: "Invite Your Team", body: "Send email invitations with one click. Team members join and see everything in real time." },
  { number: "03", title: "Ship Faster", body: "Move cards, track progress, and close tasks. Watch your velocity compound over time." },
]

/* ── App preview SVG placeholder ── */
function AppPreview() {
  return (
    <svg
      viewBox="0 0 720 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="TaskFlow app preview placeholder"
      role="img"
    >
      {/* Window chrome */}
      <rect width="720" height="440" rx="16" fill="#080d1f" />
      <rect width="720" height="44" rx="16" fill="#0d1224" />
      <rect y="28" width="720" height="16" fill="#0d1224" />
      {/* Traffic lights */}
      <circle cx="24" cy="22" r="6" fill="#ff5f57" />
      <circle cx="44" cy="22" r="6" fill="#febc2e" />
      <circle cx="64" cy="22" r="6" fill="#28c840" />
      {/* Title bar text */}
      <rect x="280" y="16" width="160" height="12" rx="4" fill="#1e2640" />

      {/* Sidebar */}
      <rect x="0" y="44" width="180" height="396" fill="#080d1f" />
      <rect x="12" y="64" width="156" height="36" rx="8" fill="#7c3aed" fillOpacity="0.2" />
      <rect x="28" y="77" width="80" height="10" rx="3" fill="#a78bfa" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="12" y={116 + i * 48} width="156" height="36" rx="8" fill="#0d1224" />
          <rect x="28" y={129 + i * 48} width={60 + i * 10} height="10" rx="3" fill="#2d3555" />
        </g>
      ))}

      {/* Main content area */}
      <rect x="180" y="44" width="540" height="396" fill="#050816" />

      {/* Header bar in content */}
      <rect x="196" y="60" width="200" height="16" rx="4" fill="#1e2640" />
      <rect x="588" y="56" width="116" height="26" rx="8" fill="#7c3aed" />
      <rect x="604" y="64" width="84" height="10" rx="3" fill="white" fillOpacity="0.8" />

      {/* Kanban columns */}
      {[0, 1, 2, 3].map((col) => {
        const x = 196 + col * 130
        const cardHeights = [80, 60, 90, 70]
        return (
          <g key={col}>
            {/* Column header */}
            <rect x={x} y={100} width={118} height={28} rx="6" fill="#0d1224" />
            <rect x={x + 10} y={112} width={60} height={8} rx="3" fill="#2d3555" />
            <circle cx={x + 100} cy={114} r={8} fill={["#7c3aed22", "#1e40af22", "#15803d22", "#92400e22"][col]} />
            <text x={x + 100} y={118} fontSize="8" fill={["#a78bfa", "#60a5fa", "#4ade80", "#fb923c"][col]} textAnchor="middle">{col + 2}</text>

            {/* Cards in column */}
            {[0, 1].map((card) => {
              const cy = 142 + card * (cardHeights[col] + 8)
              return (
                <g key={card}>
                  <rect x={x} y={cy} width={118} height={cardHeights[col]} rx="8" fill="#0d1224" />
                  <rect x={x + 10} y={cy + 12} width={80} height={8} rx="3" fill="#1e2640" />
                  <rect x={x + 10} y={cy + 26} width={55} height={6} rx="3" fill="#161d35" />
                  <rect x={x + 10} y={cy + cardHeights[col] - 18} width={28} height={8} rx="4"
                    fill={["#7c3aed33", "#1e40af33", "#15803d33", "#92400e33"][col]} />
                  <rect x={x + 80} y={cy + cardHeights[col] - 20} width={16} height={16} rx="8" fill="#1e2640" />
                </g>
              )
            })}
          </g>
        )
      })}

      {/* Subtle violet glow overlay */}
      <ellipse cx="360" cy="220" rx="300" ry="160" fill="#7c3aed" fillOpacity="0.03" />
    </svg>
  )
}

/* ── Page component ── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">
      <LandingNav />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-violet-600 opacity-[0.08] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-sm font-medium mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" aria-hidden="true" />
              Unlimited Boards &middot; Real-time Updates &middot; Built for Teams
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.1}
            variants={fadeUp}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Manage Tasks.{" "}
            <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
              Ship Faster.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={fadeUp}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            The modern kanban board for teams that want to move fast. Organize work,
            track progress, and collaborate — all in one place.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.3}
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-base transition-colors duration-200 shadow-lg shadow-violet-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050816]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-semibold text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* App preview */}
        <motion.div
          initial={{ opacity: 0, y: 48, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="relative z-10 mt-16 w-full max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-violet-900/40 shadow-2xl shadow-black/50 overflow-hidden">
            <AppPreview />
          </div>
          {/* Glow under preview */}
          <div
            className="absolute -bottom-12 inset-x-8 h-24 bg-violet-600 opacity-20 blur-3xl rounded-full pointer-events-none"
            aria-hidden="true"
          />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Everything you need
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="features-heading"
              className="text-4xl sm:text-5xl font-bold text-white"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              Built for the way teams work
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
              Everything you need to plan, track, and ship — nothing you don&rsquo;t.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                className="glass rounded-2xl p-6 hover:border-violet-500/30 transition-colors duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center mb-4 group-hover:bg-violet-600/30 transition-colors duration-300">
                  <f.icon className="h-5 w-5 text-violet-400" aria-hidden="true" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-violet-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Simple by design
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="how-heading"
              className="text-4xl sm:text-5xl font-bold text-white"
            >
              Up and running in minutes
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step) => (
              <motion.div key={step.number} variants={fadeUp} className="relative text-center md:text-left">
                <span className="text-6xl font-black text-violet-600/20 leading-none select-none" aria-hidden="true">
                  {step.number}
                </span>
                <h3 className="text-white font-semibold text-xl mt-2 mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto rounded-3xl relative overflow-hidden border border-violet-500/20 bg-gradient-to-br from-violet-900/40 via-purple-900/20 to-[#080d1f] p-12 sm:p-16 text-center"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-violet-600 opacity-10 blur-3xl rounded-full" />
          </div>
          <p className="relative text-violet-300 text-sm font-semibold uppercase tracking-widest mb-4">
            Start for free
          </p>
          <h2
            className="relative text-4xl sm:text-5xl font-bold text-white mb-6"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            Ready to ship faster?
          </h2>
          <p className="relative text-slate-400 text-lg mb-10 max-w-lg mx-auto">
            Join teams already using TaskFlow to organize their work and move faster.
            No credit card required.
          </p>
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-lg transition-colors duration-200 shadow-xl shadow-violet-900/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d1f]"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  )
}
