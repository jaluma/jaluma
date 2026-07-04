'use client'

import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useState, useEffect, useRef, createContext, useContext } from 'react'

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const LINKS = {
  github:     'https://github.com/jaluma',
  linkedin:   'https://linkedin.com/in/jmartinezalvarez',
  email:      'mailto:javiermartinezalvarez98@gmail.com',
  zylon:      'https://zylon.ai',
  privateGPT: 'https://github.com/zylon-ai/private-gpt',
  ollama:     'https://github.com/ollama/ollama',
  uniovi:     'https://www.uniovi.es',
  unir:       'https://www.unir.net',
}

const NAV_SECTIONS = [
  { id: 'hero',       label: 'home'       },
  { id: 'experience', label: 'experience' },
  { id: 'work',       label: 'work'       },
  { id: 'oss',        label: 'oss'        },
  { id: 'education',  label: 'education'  },
]

const sp   = { type: 'spring' as const, stiffness: 60,  damping: 18 }
const book = { type: 'spring' as const, stiffness: 40,  damping: 20, mass: 0.8 }
const snap = { type: 'spring' as const, stiffness: 220, damping: 28, mass: 0.4 }

// ─────────────────────────────────────────────────────────────────
// Scroll container context
// ─────────────────────────────────────────────────────────────────

const ContainerCtx = createContext<React.RefObject<HTMLDivElement>>(
  { current: null } as unknown as React.RefObject<HTMLDivElement>
)

function goToSection(container: HTMLDivElement | null, id: string) {
  if (!container) return
  const el = container.querySelector(`#${id}`) as HTMLElement | null
  if (el) container.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
}

// ─────────────────────────────────────────────────────────────────
// Particle canvas
// ─────────────────────────────────────────────────────────────────

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize, { passive: true })
    const pts = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.28 + 0.06,
    }))
    let id = 0
    let running = true
    const tick = () => {
      if (!running) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of pts) {
        p.x = (p.x + p.vx + canvas.width)  % canvas.width
        p.y = (p.y + p.vy + canvas.height) % canvas.height
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(167,139,250,${p.a})`
        ctx.fill()
      }
      id = requestAnimationFrame(tick)
    }
    const onVisibility = () => {
      if (document.hidden) { running = false; cancelAnimationFrame(id) }
      else { running = true; tick() }
    }
    document.addEventListener('visibilitychange', onVisibility)
    tick()
    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      cancelAnimationFrame(id)
    }
  }, [])
  return <canvas ref={ref} className="fixed inset-0 pointer-events-none z-[1]" aria-hidden />
}

// ─────────────────────────────────────────────────────────────────
// Chrome
// ─────────────────────────────────────────────────────────────────

function ScrollProgress() {
  const containerRef = useContext(ContainerCtx)
  const { scrollYProgress } = useScroll({ container: containerRef as React.RefObject<HTMLElement> })
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
      style={{ scaleX, background: 'linear-gradient(90deg,#7c3aed,#06b6d4,#7c3aed)' }}
    />
  )
}

function SectionDots() {
  const containerRef = useContext(ContainerCtx)
  const [active, setActive] = useState('hero')
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { root: container, threshold: 0.4 }
    )
    NAV_SECTIONS.forEach(({ id }) => {
      const el = container.querySelector(`#${id}`)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [containerRef])
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 items-end">
      {NAV_SECTIONS.map(({ id, label }) => (
        <button type="button" key={id} onClick={() => goToSection(containerRef.current, id)}
          className="flex items-center gap-2.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded" aria-label={`Go to ${label}`}>
          <span className="font-mono text-sm text-muted opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">{label}</span>
          <motion.div className="rounded-full" animate={{
            width:           active === id ? 8 : 4,
            height:          active === id ? 8 : 4,
            backgroundColor: active === id ? '#a78bfa' : 'rgba(255,255,255,0.18)',
            boxShadow:       active === id ? '0 0 12px rgba(167,139,250,0.8)' : 'none',
          }} transition={{ duration: 0.22 }} />
        </button>
      ))}
    </div>
  )
}

function Spotlight() {
  const divRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (divRef.current)
        divRef.current.style.background = `radial-gradient(800px circle at ${e.clientX}px ${e.clientY}px, rgba(124,58,237,0.11), transparent 70%)`
    }
    window.addEventListener('mousemove', h, { passive: true })
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return (
    <div ref={divRef} aria-hidden className="pointer-events-none fixed inset-0 z-20" />
  )
}

function FloatingBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      <div className="blob" style={{ width:1100,height:1100,top:'-25%',left:'-20%',background:'radial-gradient(circle,rgba(124,58,237,0.22) 0%,transparent 70%)',animation:'blob-float 32s ease-in-out infinite' }} />
      <div className="blob" style={{ width:850,height:850,bottom:'-22%',right:'-12%',background:'radial-gradient(circle,rgba(6,182,212,0.16) 0%,transparent 70%)',animation:'blob-float-alt 27s ease-in-out infinite' }} />
      <div className="blob" style={{ width:600,height:600,top:'36%',left:'52%',background:'radial-gradient(circle,rgba(99,102,241,0.13) 0%,transparent 70%)',animation:'blob-float 44s ease-in-out infinite reverse' }} />
      <div className="blob" style={{ width:320,height:320,top:'10%',right:'18%',background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)',animation:'blob-float-alt 21s ease-in-out infinite' }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Page — snap section with book-open animation
// ─────────────────────────────────────────────────────────────────

function Page({ id, children }: { id: string; children: React.ReactNode }) {
  const containerRef = useContext(ContainerCtx)
  const sectionRef   = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(id === 'hero')
  useEffect(() => {
    const container = containerRef.current
    const section   = sectionRef.current
    if (!container || !section) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { root: container, threshold: 0.5 }
    )
    obs.observe(section)
    return () => obs.disconnect()
  }, [containerRef])
  return (
    <section id={id} ref={sectionRef}
      className="snap-section min-h-screen overflow-y-auto flex-shrink-0 relative">
      <motion.div
        animate={visible
          ? { opacity: 1, y: 0, scaleY: 1, filter: 'blur(0px)' }
          : { opacity: 0, y: 48, scaleY: 0.94, filter: 'blur(10px)' }}
        transition={book}
        style={{ transformOrigin: 'top center', transformPerspective: 1400, minHeight: '100vh' }}>
        {children}
      </motion.div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────

function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref    = useRef<HTMLDivElement>(null)
  const [hov, setHov] = useState(false)
  const [sheen, setSheen] = useState({ x: 50, y: 50 })
  const mx  = useMotionValue(0.5)
  const my  = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(my, [0,1], [5,-5]), snap)
  const rotateY = useSpring(useTransform(mx, [0,1], [-5,5]), snap)
  return (
    <motion.div ref={ref} style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(e) => {
        if (!ref.current) return
        const r  = ref.current.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width
        const ny = (e.clientY - r.top)  / r.height
        mx.set(nx); my.set(ny); setSheen({ x: nx * 100, y: ny * 100 })
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); setHov(false) }}
      className={`relative ${className}`}>
      {hov && (
        <div aria-hidden className="absolute inset-0 rounded-[20px] pointer-events-none z-10"
             style={{ background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.09), transparent 55%)` }} />
      )}
      {children}
    </motion.div>
  )
}

function GlassCard({ children, className = '', href, 'aria-label': al }: {
  children: React.ReactNode; className?: string; href?: string; 'aria-label'?: string
}) {
  const base = `liquid-glass rounded-[20px] ${className}`
  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={al}
       className={`${base} block group transition-all duration-300 hover:-translate-y-0.5
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400
                   focus-visible:ring-offset-2 focus-visible:ring-offset-bg`}>
      {children}
    </a>
  )
  return <div className={base}>{children}</div>
}

function Tag({ label }: { label: string }) {
  return (
    <span className="font-mono text-sm text-cyan bg-cyan/15 border border-cyan/35 px-2.5 py-0.5 rounded-full">
      {label}
    </span>
  )
}

function PRBadge({ type }: { type: 'feat' | 'fix' }) {
  const c = { feat: 'text-accent-light bg-violet-500/20 border-violet-500/40', fix: 'text-cyan bg-cyan/15 border-cyan/35' }
  return <span className={`font-mono text-sm px-2 py-0.5 rounded-full border shrink-0 ${c[type]}`}>{type}</span>
}

function Accordion({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const id = label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="mt-4">
      <button type="button" onClick={() => setOpen(!open)}
        aria-expanded={open} aria-controls={`accordion-${id}`}
        className="flex items-center gap-2 font-mono text-sm text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded">
        <span className="text-accent-light" aria-hidden>{open ? '−' : '+'}</span>
        {label}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`accordion-${id}`}
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden">
            <div className="pt-3 space-y-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="text-accent-light/90 hover:text-accent-light transition-colors underline underline-offset-2 decoration-accent-light/30 hover:decoration-accent-light">
      {children}
    </a>
  )
}

function SectionLabel({ label, accent = 'cyan' }: { label: string; accent?: 'cyan' | 'violet' }) {
  const pill = accent === 'violet'
    ? 'text-accent-light bg-violet-500/20 border border-violet-500/40'
    : 'text-cyan bg-cyan/15 border border-cyan/35'
  return (
    <div className="flex items-center gap-4 mb-10">
      <span className={`font-mono text-sm tracking-widest px-3 py-1.5 rounded-full ${pill}`}>// {label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.07] to-transparent" />
    </div>
  )
}

// Subtle magnetic pull on small interactive elements (nav links, social pills)
function Magnetic({ children, strength = 0.12 }: { children: React.ReactNode; strength?: number }) {
  const ref  = useRef<HTMLDivElement>(null)
  const x    = useMotionValue(0)
  const y    = useMotionValue(0)
  const sx   = useSpring(x, { stiffness: 180, damping: 18 })
  const sy   = useSpring(y, { stiffness: 180, damping: 18 })
  return (
    <motion.div ref={ref} style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        if (!ref.current) return
        const r  = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width  / 2)) * strength)
        y.set((e.clientY - (r.top  + r.height / 2)) * strength)
      }}
      onMouseLeave={() => { x.set(0); y.set(0) }}>
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Typewriter
// ─────────────────────────────────────────────────────────────────

function Typewriter({ phrases }: { phrases: string[] }) {
  const [idx,  setIdx]  = useState(0)
  const [char, setChar] = useState(0)
  const [del,  setDel]  = useState(false)
  const [wait, setWait] = useState(false)
  useEffect(() => {
    if (wait) { const t = setTimeout(() => { setWait(false); setDel(true) }, 2200); return () => clearTimeout(t) }
    const phrase = phrases[idx]
    if (!del && char === phrase.length) { setWait(true); return }
    if (del  && char === 0)            { setDel(false); setIdx(i => (i + 1) % phrases.length); return }
    const t = setTimeout(() => setChar(c => del ? c - 1 : c + 1), del ? 32 : 62)
    return () => clearTimeout(t)
  }, [char, del, wait, idx, phrases])
  return (
    <span aria-label={phrases[idx]}>
      {phrases[idx].slice(0, char)}<span className="cursor-blink text-cyan/80" aria-hidden>▌</span>
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────────

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ran = useRef(false)
  return (
    <motion.span onViewportEnter={() => {
      if (ran.current) return
      ran.current = true
      const dur = 2000, t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1)
        setVal(Math.round((1 - Math.pow(1 - p, 4)) * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }}>{val}{suffix}</motion.span>
  )
}

// ─────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────

const experiences = [
  {
    company:     'Zylon',
    href:        LINKS.zylon,
    role:        'Product AI Engineer',
    period:      'May 2024 – Present',
    status:      'current' as const,
    description: 'Lead AI product development end to end: setting technical direction, shipping features, and turning a greenfield product into a platform used by enterprise customers in regulated industries.',
    highlights: [
      { label: 'PrivateGPT',          detail: 'Main contributor. 57k+ ⭐ open-source backbone of the platform.',   href: LINKS.privateGPT, accent: 'violet' as const },
      { label: 'Model serving',       detail: 'Triton + vLLM on Kubernetes, fully on-premises deployments',        href: null,            accent: 'violet' as const },
      { label: 'Sandboxed execution', detail: 'Secure runtime that lets LLMs perform real actions safely',          href: null,            accent: 'cyan'   as const },
      { label: 'Agentic systems',     detail: 'Tool calling, MCP, RAG. LangChain, LlamaIndex, custom framework.',   href: null,            accent: 'cyan'   as const },
    ],
    bullets: null,
  },
  {
    company:     'Freightol',
    href:        null,
    role:        'Software Engineer',
    period:      'Sep. 2020 – May 2024',
    status:      null,
    description: null,
    highlights:  null,
    bullets: [
      'Industry 4.0 microservices on AKS with Terraform, integrating ERP and CRM systems.',
      'RAG-based AI system for querying company documents through natural language.',
      'AI-driven data extraction pipeline scraping and structuring external sources.',
    ],
  },
  {
    company:     'Seresco',
    href:        null,
    role:        'Software Engineer Intern',
    period:      'Sep. 2019 – Apr. 2020',
    status:      null,
    description: null,
    highlights:  null,
    bullets: [
      'AI-based automation systems for factory floor tasks using TensorFlow.',
      'Microservice architectures on AKS.',
    ],
  },
]

const whatIBuild = [
  {
    title:       'Open source GenAI',
    description: 'Deep in the OSS AI ecosystem. Main collaborator on PrivateGPT, contributor to LlamaIndex and Ollama. Most of production AI runs on code someone shared for free.',
    tags:        ['PrivateGPT', 'LlamaIndex', 'Ollama'],
    accent:      'cyan' as const,
  },
  {
    title:       'Local and private inference',
    description: 'Deploying models on your own hardware: vLLM and Triton on Kubernetes with GPU Operator, serving LLMs, embeddings, rerankers, and OCR fully on-premises, including air-gapped environments.',
    tags:        ['vLLM', 'Triton', 'Kubernetes'],
    accent:      'violet' as const,
  },
  {
    title:       'Multi-agent systems',
    description: 'Agents that do real work: tool calling, MCP servers, RAG over large document corpora, and sandboxed code execution. Building the infrastructure that lets LLMs act, not just respond.',
    tags:        ['LangChain', 'MCP', 'RAG'],
    accent:      'violet' as const,
  },
  {
    title:       'What I am exploring',
    description: 'Agent memory and long-horizon reasoning: how AI systems build, retain, and use knowledge across sessions. Evaluation frameworks, structured reasoning, and where GenAI meets classical software.',
    tags:        ['Memory', 'Reasoning', 'Evaluation'],
    accent:      'cyan' as const,
  },
]

const sourceCodeDive = [
  { name: 'vLLM',                    description: 'High-throughput LLM and embedding inference engine',    href: 'https://github.com/vllm-project/vllm' },
  { name: 'Triton Inference Server', description: 'NVIDIA optimized inference server for GPU models',      href: 'https://github.com/triton-inference-server/server' },
  { name: 'docling',                 description: 'Advanced document understanding: OCR, layout, parsing', href: 'https://github.com/DS4SD/docling' },
  { name: 'OpenSandbox',             description: 'Secure, extensible sandbox runtime for AI agents',      href: 'https://github.com/jaluma/OpenSandbox' },
]

const ecosystemTools = ['LangChain', 'LlamaIndex', 'Qdrant', 'Opik', 'MLflow']

const llamaPRs: { title: string; href: string; type: 'feat' | 'fix' }[] = [
  { title: 'Allow to limit how many elements retrieve (Qdrant)', href: 'https://github.com/run-llama/llama_index/pull/14904', type: 'feat' },
  { title: 'Fix crash LLMMetadata',                             href: 'https://github.com/run-llama/llama_index/pull/14569', type: 'fix'  },
  { title: 'Fix Qdrant nodes',                                  href: 'https://github.com/run-llama/llama_index/pull/14149', type: 'fix'  },
  { title: 'Fix neo4j query insensitive',                       href: 'https://github.com/run-llama/llama_index/pull/12337', type: 'fix'  },
]

const education = [
  { degree: 'PhD in Computer Science',     institution: 'University of Oviedo',                 period: 'Sep. 2026',              note: 'Research: memory systems for LLM-based agents', status: 'incoming' as const, href: LINKS.uniovi },
  { degree: 'MSc Artificial Intelligence', institution: 'International University of La Rioja',  period: 'Oct. 2023 – Oct. 2025',  note: '',                                              status: null,                href: LINKS.unir   },
  { degree: 'BSc Software Engineering',    institution: 'University of Oviedo',                  period: 'Sep. 2016 – Jul. 2020',  note: '',                                              status: null,                href: LINKS.uniovi },
]

// ─────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const containerRef  = useRef<HTMLDivElement>(null)
  const activeIdxRef  = useRef(0)

  // Track which section is active (ref only — no re-render needed)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = NAV_SECTIONS.findIndex(s => s.id === e.target.id)
          if (idx !== -1) activeIdxRef.current = idx
        }
      }),
      { root: container, threshold: 0.5 }
    )
    NAV_SECTIONS.forEach(({ id }) => {
      const el = container.querySelector(`#${id}`)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  // Arrow + Enter keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON' || tag === 'A') return
      if (el?.isContentEditable) return
      const idx = activeIdxRef.current
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        goToSection(containerRef.current, NAV_SECTIONS[Math.min(idx + 1, NAV_SECTIONS.length - 1)].id)
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        goToSection(containerRef.current, NAV_SECTIONS[Math.max(idx - 1, 0)].id)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <ContainerCtx.Provider value={containerRef as React.RefObject<HTMLDivElement>}>

      {/* ── Fixed ambient ────────────────────────────────── */}
      <div className="fixed inset-0 bg-grid pointer-events-none z-0" aria-hidden />
      <FloatingBlobs />
      <ParticleCanvas />
      <Spotlight />
      <ScrollProgress />
      <SectionDots />

      {/* ── Fixed nav ────────────────────────────────────── */}
      <div className="fixed top-5 inset-x-0 z-50 px-5">
        <div className="liquid-glass-nav max-w-4xl mx-auto px-7 h-12 flex items-center justify-between rounded-full">
          <span className="font-mono text-base text-accent-light tracking-tight">~/jaluma</span>
          <nav className="flex gap-6" aria-label="Main navigation">
            {NAV_SECTIONS.filter(s => s.id !== 'hero').map(({ id, label }) => (
              <button type="button" key={id} onClick={() => goToSection(containerRef.current, id)}
                aria-label={`Go to ${label}`}
                className="font-mono text-sm text-muted hover:text-text transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded">
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Scroll snap container ──────────────────────── */}
      <div ref={containerRef} className="scroll-container h-screen overflow-y-scroll relative z-30">

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 1 – HERO                               */}
        {/* ════════════════════════════════════════════ */}
        <Page id="hero">
          <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-8 pt-24 pb-8">

            <motion.div className="flex-1 flex flex-col justify-center"
              initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

              <motion.div variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0} }} transition={sp} className="mb-5">
                <span className="inline-flex items-center gap-2 font-mono text-sm text-cyan tracking-[0.22em] bg-cyan/15 border border-cyan/35 px-4 py-1.5 rounded-full">
                  // product_ai_engineer
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                variants={{ hidden:{opacity:0,y:28}, visible:{opacity:1,y:0} }} transition={sp}
                className="font-bold tracking-[-0.035em] leading-[0.92] mb-6 select-none"
                style={{
                  fontSize: 'clamp(58px, 10vw, 100px)',
                  background: 'linear-gradient(140deg, #ffffff 0%, #e8e0ff 28%, #a78bfa 52%, #38bdf8 78%, #f0f0fa 100%)',
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                Javier<br />Martínez
              </motion.h1>

              {/* Typewriter */}
              <motion.div variants={{ hidden:{opacity:0,y:12}, visible:{opacity:1,y:0} }} transition={sp}
                className="font-mono text-base text-muted mb-6 h-7">
                <Typewriter phrases={['product_ai_engineer', 'oss_contributor', 'phd_candidate']} />
              </motion.div>

              {/* Bio */}
              <motion.p variants={{ hidden:{opacity:0,y:12}, visible:{opacity:1,y:0} }} transition={sp}
                className="text-muted leading-relaxed text-base max-w-lg mb-2">
                I build AI systems at the intersection of research and production. Hard problems with people who care about shipping things that work.
              </motion.p>
              <motion.p variants={{ hidden:{opacity:0,y:12}, visible:{opacity:1,y:0} }} transition={sp}
                className="text-muted leading-relaxed text-base max-w-lg mb-8">
                Currently leading AI at <InlineLink href={LINKS.zylon}>Zylon</InlineLink>, building private AI infrastructure for enterprise customers in regulated industries.
              </motion.p>

              {/* Social links with magnetic pull */}
              <motion.div variants={{ hidden:{opacity:0,y:10}, visible:{opacity:1,y:0} }} transition={sp}
                className="flex flex-wrap items-center gap-2.5">
                {[
                  { label: 'github',   href: LINKS.github,   ext: true  },
                  { label: 'linkedin', href: LINKS.linkedin, ext: true  },
                  { label: 'email',    href: LINKS.email,    ext: false },
                ].map(({ label, href, ext }) => (
                  <Magnetic key={label}>
                    <a href={href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined}
                       className="liquid-glass font-mono text-sm text-muted hover:text-text px-4 py-2 rounded-full transition-all duration-200 hover:-translate-y-px block
                                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
                      {label} ↗
                    </a>
                  </Magnetic>
                ))}
              </motion.div>
            </motion.div>

            {/* Stats bar */}
            <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{...sp,delay:0.65}}>
              <div className="grid grid-cols-3 gap-px rounded-[21px] overflow-hidden"
                   style={{background:'rgba(255,255,255,0.04)'}} role="list" aria-label="Key stats">
                {[
                  { to:57, suffix:'k+', label:'GitHub Stars',       sub:'open source'          },
                  { to: 3, suffix:'+',  label:'Years GenAI',        sub:'at Zylon'             },
                  { to: 6, suffix:'+',  label:'Years Engineering',  sub:'Software Engineering' },
                ].map(({to,suffix,label,sub}) => (
                  <div key={label} className="liquid-glass px-5 py-5 text-center" role="listitem">
                    <p className="font-bold text-3xl sm:text-4xl text-text tracking-tight leading-none stat-glow mb-1.5">
                      <Counter to={to} suffix={suffix} />
                    </p>
                    <p className="font-mono text-sm text-text tracking-wider uppercase">{label}</p>
                    <p className="font-mono text-sm text-muted mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Scroll hint */}
            <motion.div className="flex items-center gap-3 mt-5 self-start"
              initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1,duration:0.8}} aria-hidden>
              <motion.div animate={{y:[0,6,0]}} transition={{duration:2.4,repeat:Infinity,ease:'easeInOut'}}
                className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
              <span className="font-mono text-sm text-muted tracking-widest">scroll to explore</span>
            </motion.div>
          </div>
        </Page>

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 2 – EXPERIENCE                         */}
        {/* ════════════════════════════════════════════ */}
        <Page id="experience">
          <div className="h-screen flex items-center">
            <div className="max-w-4xl mx-auto px-8 py-6 w-full">
              <SectionLabel label="experience" accent="violet" />

              <div className="relative">
                {/* Timeline line */}
                <motion.div
                  className="absolute top-2 bottom-2 w-px"
                  style={{ left: '5px', background: 'linear-gradient(to bottom, rgba(167,139,250,0.7), rgba(6,182,212,0.4), rgba(255,255,255,0.06))' }}
                  initial={{ scaleY: 0, originY: 0 }} whileInView={{ scaleY: 1 }}
                  viewport={{ once: false }} transition={{ duration: 1.2, ease: 'easeOut' }}
                  aria-hidden
                />

                <ol className="space-y-4">
                  {experiences.map((job, i) => {
                    const isCurrent = job.status === 'current'
                    return (
                      <li key={job.company}>
                        <motion.div className="flex gap-5 items-start"
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false, amount: 0.3 }} transition={{ ...sp, delay: i * 0.12 }}>

                          {/* Dot */}
                          <div className="shrink-0 mt-[18px] relative z-10" aria-hidden>
                            <div className={`rounded-full border-2 ${
                              isCurrent
                                ? 'w-[11px] h-[11px] border-accent-light bg-accent-light/30 shadow-[0_0_12px_rgba(167,139,250,0.6)]'
                                : 'w-[9px] h-[9px] border-cyan/50 bg-cyan/10'
                            }`} />
                          </div>

                          {/* Card */}
                          <div className="flex-1">
                            <GlassCard className="p-5">
                              {/* Header */}
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-0.5">
                                    {job.href
                                      ? <a href={job.href} target="_blank" rel="noopener noreferrer"
                                           className="font-semibold text-base text-text hover:text-accent-light transition-colors">
                                          {job.company}
                                        </a>
                                      : <span className="font-semibold text-base text-text">{job.company}</span>
                                    }
                                    {isCurrent && (
                                      <span className="font-mono text-sm text-cyan bg-cyan/15 border border-cyan/35 px-2 py-0.5 rounded-full">
                                        current
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-mono text-sm text-accent-light">{job.role}</p>
                                </div>
                                <p className="font-mono text-sm text-muted shrink-0">{job.period}</p>
                              </div>

                              {/* Zylon: description + 2×2 highlight grid */}
                              {job.description && (
                                <p className="font-mono text-base text-muted leading-relaxed mb-4">{job.description}</p>
                              )}
                              {job.highlights && (
                                <div className="grid sm:grid-cols-2 gap-2.5">
                                  {job.highlights.map(({ label, detail, href, accent }, hi) => {
                                    const isViolet = accent === 'violet'
                                    const bar    = isViolet ? 'linear-gradient(90deg,#7c3aed,#06b6d4)' : 'linear-gradient(90deg,#06b6d4,#7c3aed)'
                                    const tagClr = isViolet
                                      ? 'text-accent-light bg-violet-500/20 border-violet-500/40'
                                      : 'text-cyan bg-cyan/15 border-cyan/35'
                                    const inner = (
                                      <motion.div key={label}
                                        initial={{ opacity:0, x: hi%2===0 ? -14 : 14 }} whileInView={{ opacity:1, x:0 }}
                                        viewport={{ once:false, amount:0.3 }} transition={{ ...sp, delay: hi*0.06 }}
                                        className="liquid-glass rounded-[12px] p-3.5 hover:-translate-y-0.5 transition-transform duration-200">
                                        <div className="h-[2px] w-6 rounded-full mb-2.5" style={{ background: bar }} />
                                        <p className={`font-mono text-sm px-2 py-0.5 rounded-full border inline-block mb-1.5 ${tagClr}`}>{label}</p>
                                        <p className="font-mono text-sm text-text leading-relaxed">{detail}</p>
                                      </motion.div>
                                    )
                                    return href
                                      ? <a key={label} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
                                      : inner
                                  })}
                                </div>
                              )}

                              {/* Freightol / Seresco: bullets */}
                              {job.bullets && (
                                <ul className="space-y-1.5">
                                  {job.bullets.map((b, j) => (
                                    <li key={j} className="flex gap-2 items-start">
                                      <span className="text-accent-light/70 shrink-0 font-mono text-sm mt-[3px]">›</span>
                                      <span className="font-mono text-sm text-text leading-relaxed">{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </GlassCard>
                          </div>
                        </motion.div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
          </div>
        </Page>

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 3 – WHAT I BUILD                       */}
        {/* ════════════════════════════════════════════ */}
        <Page id="work">
          <div className="h-screen flex items-center">
            <div className="max-w-4xl mx-auto px-8 py-6 w-full">
              <SectionLabel label="domains" />
              <div className="grid sm:grid-cols-2 gap-4">
                {whatIBuild.map(({title, description, tags, accent}, i) => {
                  const isCyan = accent === 'cyan'
                  const tint   = isCyan ? 'rgba(6,182,212,0.07)'   : 'rgba(124,58,237,0.09)'
                  const glow   = isCyan ? 'rgba(6,182,212,0.22)'   : 'rgba(167,139,250,0.22)'
                  const bar    = isCyan ? 'linear-gradient(90deg,#06b6d4,#7c3aed)' : 'linear-gradient(90deg,#7c3aed,#06b6d4)'
                  const tagClr = isCyan
                    ? 'text-cyan bg-cyan/15 border-cyan/35'
                    : 'text-accent-light bg-violet-500/20 border-violet-500/40'
                  return (
                    <motion.div key={title}
                      initial={{opacity:0, x:i%2===0?-28:28, y:16}}
                      whileInView={{opacity:1, x:0, y:0}}
                      viewport={{once:false, amount:0.25}}
                      transition={{...sp, delay:i*0.08}}>
                      <TiltCard className="h-full">
                        <div
                          className="liquid-glass rounded-[20px] p-6 h-full overflow-hidden relative flex flex-col
                                     transition-all duration-300 group/card"
                          style={{ background: `linear-gradient(145deg, ${tint} 0%, rgba(255,255,255,0.04) 100%)` }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 1px ${glow}, 0 24px 64px rgba(0,0,0,0.28)` }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '' }}>
                          <div className="absolute top-2 right-4 font-mono font-black text-[80px] leading-none select-none pointer-events-none"
                               aria-hidden style={{color:'rgba(255,255,255,0.028)'}}>
                            {String(i+1).padStart(2,'0')}
                          </div>
                          <div className="h-[3px] w-12 rounded-full mb-5" style={{background:bar, boxShadow:`0 0 10px ${glow}`}} />
                          <h3 className="font-semibold text-text text-base mb-3 leading-snug pr-8">{title}</h3>
                          <p className="text-base text-muted leading-relaxed flex-1">{description}</p>
                          <div className="flex flex-wrap gap-1.5 mt-5">
                            {tags.map(t => (
                              <span key={t} className={`font-mono text-sm px-2.5 py-0.5 rounded-full border ${tagClr}`}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </TiltCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </Page>

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 4 – OPEN SOURCE                        */}
        {/* ════════════════════════════════════════════ */}
        <Page id="oss">
          <div className="h-screen flex items-center">
            <div className="max-w-4xl mx-auto px-8 py-6 w-full">
              <SectionLabel label="open_source" accent="violet" />

              <div className="grid lg:grid-cols-2 gap-4">
                {/* Left col */}
                <div className="space-y-3">
                  {/* PrivateGPT — hero card */}
                  <div className="glow-border p-[1.5px] rounded-[22px] relative group/pgpt">
                    <a href={LINKS.privateGPT} target="_blank" rel="noopener noreferrer"
                       aria-label="View PrivateGPT on GitHub, 57k+ stars"
                       className="absolute inset-0 rounded-[22px] z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-1 focus-visible:ring-offset-bg" />
                    <div className="liquid-glass-featured rounded-[21px] p-5 relative overflow-hidden transition-transform duration-300 group-hover/pgpt:-translate-y-0.5">
                      <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full opacity-20 pointer-events-none"
                           style={{background:'radial-gradient(circle,#7c3aed,transparent 70%)'}} aria-hidden />
                      <div className="flex items-start justify-between mb-3 relative">
                        <div>
                          <h3 className="font-bold text-white text-lg group-hover/pgpt:text-accent-light transition-colors leading-tight">PrivateGPT</h3>
                          <p className="font-mono text-sm text-white/60 mt-0.5">zylon-ai/private-gpt</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-bold text-3xl text-accent-light leading-none tracking-tight stat-glow"><Counter to={57} suffix="k+" /></p>
                          <p className="font-mono text-sm text-white/60 mt-0.5">GitHub stars</p>
                        </div>
                      </div>
                      <p className="text-white/85 text-sm leading-relaxed relative">
                        Main collaborator — <span className="text-accent-light font-semibold">57k+ GitHub stars</span>. The open-source backbone of Zylon&apos;s AI platform. Shipped core features: code execution, MCP integration, and multi-provider inference.
                      </p>
                    </div>
                  </div>

                  {/* LlamaIndex */}
                  <GlassCard href="https://github.com/run-llama/llama_index" aria-label="LlamaIndex contributions" className="p-5">
                    <h3 className="font-semibold text-text text-base group-hover:text-accent-light transition-colors">LlamaIndex</h3>
                    <p className="font-mono text-sm text-cyan mt-0.5">run-llama/llama_index</p>
                    <Accordion label="view merged PRs">
                      {llamaPRs.map(({title,href,type}) => (
                        <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-3 group/pr" aria-label={`${type}: ${title}`}>
                          <PRBadge type={type} />
                          <span className="font-mono text-sm text-muted group-hover/pr:text-text transition-colors truncate">{title}</span>
                        </a>
                      ))}
                    </Accordion>
                  </GlassCard>

                  <GlassCard href={LINKS.ollama} aria-label="Ollama contributions" className="p-5">
                    <h3 className="font-semibold text-text text-base group-hover:text-accent-light transition-colors">Ollama</h3>
                    <p className="font-mono text-sm text-cyan mt-0.5 mb-2">ollama/ollama</p>
                    <p className="font-mono text-sm text-muted leading-relaxed">Contributed during early adoption while building private AI infra at Zylon.</p>
                  </GlassCard>
                </div>

                {/* Right col */}
                <div className="space-y-3">
                  <GlassCard className="p-5">
                    <p className="font-mono text-sm text-muted mb-4 tracking-widest uppercase">source I&apos;ve worked with closely</p>
                    <ul className="space-y-3">
                      {sourceCodeDive.map(({name,description,href}) => (
                        <li key={href}>
                          <a href={href} target="_blank" rel="noopener noreferrer"
                             className="flex items-start gap-2.5 group/src" aria-label={`${name}: ${description}`}>
                            <span className="font-mono text-sm text-accent-light/50 shrink-0 mt-px group-hover/src:text-accent-light transition-colors" aria-hidden>↗</span>
                            <div>
                              <p className="font-mono text-sm text-text group-hover/src:text-accent-light transition-colors">{name}</p>
                              <p className="font-mono text-sm text-muted mt-0.5">{description}</p>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <GlassCard className="p-5">
                    <p className="font-mono text-sm text-muted mb-3 tracking-widest uppercase">ecosystem tools</p>
                    <div className="flex flex-wrap gap-2">
                      {ecosystemTools.map(t => <Tag key={t} label={t} />)}
                    </div>
                  </GlassCard>
                </div>
              </div>
            </div>
          </div>
        </Page>

        {/* ════════════════════════════════════════════ */}
        {/* PAGE 5 – EDUCATION + RESEARCH               */}
        {/* ════════════════════════════════════════════ */}
        <Page id="education">
          <div className="h-screen flex flex-col">
            <div className="flex-1 flex items-center">
              <div className="max-w-4xl mx-auto px-8 py-6 w-full">
                <SectionLabel label="education" />

                <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6">

                  {/* Timeline */}
                  <div className="relative">
                    <motion.div
                      className="absolute top-5 bottom-5 w-px"
                      style={{left:'5px', background:'linear-gradient(to bottom, rgba(167,139,250,0.6), rgba(6,182,212,0.3), transparent)'}}
                      initial={{scaleY:0, originY:0}} whileInView={{scaleY:1}}
                      viewport={{once:false}} transition={{duration:1.4, ease:'easeOut'}}
                      aria-hidden
                    />
                    <ol className="space-y-4">
                      {education.map(({degree,institution,period,note,status,href}, i) => (
                        <li key={degree}>
                          <motion.div className="flex gap-6 items-start"
                            initial={{opacity:0,x:-20}} whileInView={{opacity:1,x:0}}
                            viewport={{once:false,amount:0.3}} transition={{...sp,delay:i*0.15}}>
                            <div className="shrink-0 mt-5 relative z-10" aria-hidden>
                              <div className={`w-[11px] h-[11px] rounded-full border-2 ${
                                status==='incoming'
                                  ? 'border-accent-light bg-accent-light/30 shadow-[0_0_12px_rgba(167,139,250,0.6)]'
                                  : 'border-cyan/60 bg-cyan/15 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <GlassCard href={href} aria-label={`${degree} at ${institution}`} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h3 className="font-medium text-text text-base group-hover:text-accent-light transition-colors">{degree}</h3>
                                    <p className="font-mono text-sm text-muted mt-1">{institution}</p>
                                    {status==='incoming' && note && (
                                      <p className="font-mono text-sm text-muted mt-1.5">{note}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-mono text-sm text-muted">{period}</p>
                                    {status==='incoming' && (
                                      <span className="font-mono text-sm text-cyan bg-cyan/15 border border-cyan/35 px-2 py-0.5 rounded-full mt-2 inline-block">
                                        incoming
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </GlassCard>
                            </div>
                          </motion.div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Research spotlight */}
                  <motion.div initial={{opacity:0,x:24}} whileInView={{opacity:1,x:0}}
                    viewport={{once:false,amount:0.3}} transition={{...sp,delay:0.2}}>
                    <div className="liquid-glass rounded-[20px] p-6 h-full"
                         style={{border:'1px solid rgba(167,139,250,0.20)', background:'linear-gradient(145deg,rgba(124,58,237,0.12) 0%,rgba(255,255,255,0.04) 100%)'}}>

                      <div className="flex items-center gap-2 mb-5">
                        <span className="font-mono text-sm tracking-widest text-accent-light bg-violet-500/20 border border-violet-500/40 px-3 py-1 rounded-full">
                          // research
                        </span>
                      </div>

                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-bold text-text text-lg leading-tight">PhD Research</h3>
                          <p className="font-mono text-sm text-cyan mt-1">University of Oviedo · sep. 2026</p>
                        </div>
                        <span className="font-mono text-sm text-accent-light bg-violet-500/20 border border-violet-500/40 px-3 py-1 rounded-full shrink-0">
                          incoming
                        </span>
                      </div>

                      <p className="text-muted text-base leading-relaxed mb-4">
                        Topic: <span className="text-accent-light font-semibold">memory systems for LLM-based agents</span>.
                      </p>
                      <p className="text-muted text-base leading-relaxed mb-5">
                        The question I care about: how do agents build, retain, and use knowledge across long interactions? This connects directly to production systems I work on — where agents need to plan, act, and recover across complex workflows without losing context.
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {['Memory', 'Long-horizon reasoning', 'Agent evaluation', 'LLM agents'].map(t => (
                          <span key={t} className="font-mono text-sm text-accent-light bg-violet-500/20 border border-violet-500/40 px-2.5 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="max-w-4xl mx-auto px-8 pb-8 w-full">
              <div className="liquid-glass rounded-[20px] px-7 py-5 flex justify-between items-center">
                <span className="font-mono text-sm text-muted">javier martínez álvarez</span>
                <div className="flex items-center gap-5">
                  {[
                    { label: 'github',   href: LINKS.github   },
                    { label: 'linkedin', href: LINKS.linkedin  },
                    { label: 'email',    href: LINKS.email     },
                  ].map(({ label, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                       className="font-mono text-sm text-muted hover:text-text transition-colors">
                      {label}
                    </a>
                  ))}
                </div>
                <span className="font-mono text-sm text-muted">oviedo, spain</span>
              </div>
            </footer>
          </div>
        </Page>

      </div>
    </ContainerCtx.Provider>
  )
}
