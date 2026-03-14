"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Play } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Sign Up & Connect Accounts",
    description: "Create your MND account and connect your social media profiles. It takes less than 2 minutes!",
    details: ["Click Sign Up", "Enter your email", "Connect Instagram, TikTok, etc.", "Authorize access"],
  },
  {
    number: 2,
    title: "Set Your Growth Goals",
    description: "Define your target audience, posting frequency, and growth goals for each platform.",
    details: ["Choose your niche", "Set follower targets", "Pick posting schedule", "Select content type"],
  },
  {
    number: 3,
    title: "Create & Schedule Content",
    description: "Create amazing content or use our AI suggestions, then schedule posts across all platforms.",
    details: ["Write or upload content", "Use AI for suggestions", "Schedule posting time", "Optimize for trends"],
  },
  {
    number: 4,
    title: "Monitor & Analyze",
    description: "Track real-time analytics, engagement rates, and audience growth from your dashboard.",
    details: ["View live metrics", "Track engagement", "Analyze audience", "Export reports"],
  },
  {
    number: 5,
    title: "Optimize & Scale",
    description: "Use insights to optimize your content strategy and scale your growth exponentially.",
    details: ["Identify top content", "Refine strategy", "Automate engagement", "Scale campaigns"],
  },
]

const faqs = [
  {
    question: "How long does it take to see results?",
    answer: "Most users see noticeable growth within 2-4 weeks. The exact timeline depends on your starting point, niche, and how actively you use our tools.",
  },
  {
    question: "Is my account safe with MND?",
    answer: "Yes! We use industry-standard encryption and never store your passwords. We follow all platform guidelines to keep your account safe.",
  },
  {
    question: "Can I manage multiple accounts?",
    answer: "Absolutely! You can manage unlimited accounts across all platforms. Perfect for agencies and multi-brand businesses.",
  },
  {
    question: "What platforms does MND support?",
    answer: "We support Instagram, TikTok, YouTube, Facebook, Twitter, and LinkedIn. More platforms coming soon!",
  },
  {
    question: "Is there a free trial?",
    answer: "Yes! Sign up for a 14-day free trial with full access to all features. No credit card required.",
  },
]

export function Tutorial() {
  return (
    <section id="tutorial" className="relative py-20 md:py-32 px-8 md:px-12 bg-white">
      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <p className="font-mono text-xs tracking-[0.3em] text-rose-600 mb-4">08 — HOW TO USE</p>
        <h2 className="font-sans text-3xl md:text-5xl font-light italic text-slate-900 mb-16">
          Get Started in 5 Simple Steps
        </h2>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 border border-rose-200 hover:border-rose-500 transition-all duration-300 cursor-none"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 border-2 border-rose-500 bg-white text-rose-600 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>

              <div className="ml-8">
                <h3 className="font-sans text-2xl font-semibold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="font-sans text-slate-600 mb-6">{step.description}</p>

                {/* Details */}
                <div className="grid md:grid-cols-2 gap-4">
                  {step.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <span className="font-mono text-sm text-slate-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Video Tutorial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20 p-8 border border-rose-200 bg-white"
      >
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h3 className="font-sans text-2xl font-semibold text-slate-900 mb-4">Watch Our Intro Video</h3>
            <p className="font-sans text-slate-600 mb-6">
              Get a quick visual walkthrough of how to use MND. This 5-minute video covers everything you need to know to get started.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors duration-300 cursor-none"
            >
              <Play className="w-5 h-5" />
              Watch Now
            </motion.button>
          </div>
          <div className="flex-1 aspect-video border border-slate-300 bg-white flex items-center justify-center">
            <Play className="w-16 h-16 text-slate-400" />
          </div>
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="font-sans text-3xl font-light italic text-slate-900 mb-12">
          Frequently Asked Questions
        </h3>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group p-6 border border-rose-200 hover:border-rose-500 cursor-none transition-all duration-300"
            >
              <summary className="flex items-center justify-between font-semibold text-slate-900 text-lg cursor-none select-none">
                {faq.question}
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 0 }}
                  className="text-rose-600 group-open:rotate-180 transition-transform duration-300"
                >
                  ▼
                </motion.span>
              </summary>
              <p className="mt-4 font-sans text-slate-600 leading-relaxed">{faq.answer}</p>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
