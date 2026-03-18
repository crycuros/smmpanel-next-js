"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Play, Wallet, Zap, Shield, Headphones } from "lucide-react"

const steps = [
  {
    number: 1,
    title: "Create Your Account",
    description: "Sign up for free and get instant access to our SMM Panel dashboard.",
    details: ["Click Sign Up", "Enter your email", "Verify account", "Get ₱0 test credits"],
  },
  {
    number: 2,
    title: "Add Funds to Wallet",
    description: "Deposit funds using GCash, PayMaya, or bank transfer. Starting at just ₱100!",
    details: ["Choose payment method", "Enter amount", "Confirm payment", "Funds added instantly"],
  },
  {
    number: 3,
    title: "Select Your Service",
    description: "Browse our services for Instagram, TikTok, YouTube, Facebook, Twitter and more.",
    details: ["Choose platform", "Select service type", "Enter link", "Set quantity"],
  },
  {
    number: 4,
    title: "Place Your Order",
    description: "Confirm your order and watch as we deliver your followers, likes, or views.",
    details: ["Review order", "Confirm purchase", "Watch progress", "Order complete"],
  },
  {
    number: 5,
    title: "Track & Reorder",
    description: "Monitor your order status in real-time and reorder anytime you need more.",
    details: ["View order status", "Check analytics", "Reorder easily", "Earn referrals"],
  },
]

const faqs = [
  {
    question: "How long does delivery take?",
    answer: "Most orders start within 1-15 minutes! Delivery time varies by service - smaller orders are instant, larger orders may take 1-24 hours. You'll see real-time progress in your dashboard.",
  },
  {
    question: "Are the followers/likes real?",
    answer: "We offer both real and quality followers. Real followers come from active users. Quality followers are high-retention accounts. Check each service description for details.",
  },
  {
    question: "Is my account safe?",
    answer: "Yes! Our services follow platform Terms of Service. We never ask for your password. All transactions are encrypted and secure.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept GCash, PayMaya, BPI, BDO, and other Philippine bank transfers. Crypto payments (USDT) also available for resellers.",
  },
  {
    question: "Do you offer test credits?",
    answer: "Yes! New accounts get ₱0 free test credits to try our services. Simply sign up and you'll receive test credits automatically! No deposit required.",
  },
  {
    question: "How do I become a reseller?",
    answer: "Create an account, add funds, and use our API or manual ordering to provide services to your own clients. Bulk discounts available for resellers!",
  },
]

export function Tutorial() {
  return (
    <section id="tutorial" className="relative py-16 md:py-24 lg:py-32 px-4 md:px-8 lg:px-12 bg-white">
      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16 md:mb-20"
      >
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] text-rose-600 mb-3 md:mb-4">08 — HOW IT WORKS</p>
        <h2 className="font-sans text-2xl md:text-4xl lg:text-5xl font-light italic text-slate-900 mb-12 md:mb-16">
          Get Started in 5 Simple Steps
        </h2>

        {/* Steps */}
        <div className="space-y-6 md:space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-5 md:p-8 border border-rose-200 hover:border-rose-500 transition-all duration-300 cursor-pointer"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-10 h-10 md:w-12 md:h-12 border-2 border-rose-500 bg-white text-rose-600 flex items-center justify-center font-bold text-lg md:text-xl group-hover:scale-110 transition-transform duration-300">
                {step.number}
              </div>

              <div className="ml-6 md:ml-8">
                <h3 className="font-sans text-lg md:text-2xl font-semibold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="font-sans text-sm md:text-base text-slate-600 mb-4 md:mb-6">{step.description}</p>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                  {step.details.map((detail) => (
                    <div key={detail} className="flex items-center gap-2 md:gap-3">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-rose-500 flex-shrink-0" />
                      <span className="font-mono text-xs md:text-sm text-slate-700">{detail}</span>
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
        className="mb-16 md:mb-20 p-5 md:p-8 border border-rose-200 bg-white"
      >
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="flex-1">
            <h3 className="font-sans text-xl md:text-2xl font-semibold text-slate-900 mb-3 md:mb-4">Watch Our Intro Video</h3>
            <p className="font-sans text-sm md:text-base text-slate-600 mb-4 md:mb-6">
              Get a quick visual walkthrough of how to use MND SMM Panel. This 5-minute video covers everything you need to know to get started.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors duration-300"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" />
              Watch Now
            </motion.button>
          </div>
          <div className="flex-1 w-full aspect-video border border-slate-300 bg-white flex items-center justify-center">
            <Play className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
          </div>
        </div>
      </motion.div>

      {/* Features Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-16 md:mb-20"
      >
        {[
          { icon: Wallet, title: "Lowest Prices", desc: "Starting at ₱1" },
          { icon: Zap, title: "Instant Delivery", desc: "Most orders in minutes" },
          { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 md:p-6 bg-rose-50 border border-rose-200"
          >
            <feature.icon className="w-8 h-8 md:w-10 md:h-10 text-rose-600" />
            <div>
              <h4 className="font-semibold text-slate-900 text-sm md:text-base">{feature.title}</h4>
              <p className="font-mono text-xs md:text-sm text-rose-600">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h3 className="font-sans text-2xl md:text-3xl font-light italic text-slate-900 mb-8 md:mb-12">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3 md:space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group p-4 md:p-6 border border-rose-200 hover:border-rose-500 transition-all duration-300 cursor-pointer"
            >
              <summary className="flex items-center justify-between font-semibold text-slate-900 text-sm md:text-lg cursor-pointer select-none">
                {faq.question}
                <motion.span
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 0 }}
                  className="text-rose-600 group-open:rotate-180 transition-transform duration-300 text-xs md:text-sm"
                >
                  ▼
                </motion.span>
              </summary>
              <p className="mt-3 md:mt-4 font-sans text-sm md:text-base text-slate-600 leading-relaxed">{faq.answer}</p>
            </motion.details>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
