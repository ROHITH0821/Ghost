import type { MissionStage } from "./types";

/* ─── Ghost brand copy system ───────────────────────────────────────────────
   Tone: playful + mysterious on the surface, professional on insights.
   One voice everywhere — fun like a product, serious on business impact.
────────────────────────────────────────────────────────────────────────── */

export const copy = {
  meta: {
    title: "Ghost — AI Mystery Shopper Swarm",
    description:
      "See through your customers' eyes. Ghost sends AI shoppers into any website to find where people ghost your business — and how to fix it.",
    keywords: [
      "AI",
      "mystery shopper",
      "conversion optimization",
      "customer experience",
    ],
  },

  brand: {
    name: "Ghost",
    wordmark: "GHOST",
    tagline: "See through your customers' eyes.",
    alt: "Ghost",
  },

  common: {
    releaseGhostAgents: "Summon Ghost",
    deploying: "Deploying...",
    loading: "Loading...",
    newAnalysis: "New analysis",
    backToHome: "Back to home",
    copy: "Copy",
    copied: "Copied",
    live: "Live",
    chevron: "›",
    separator: "/",
    scannedPrefix: "Scanned ",
    analyzingPrefix: "Analyzing ",
    locationPrefix: "📍 ",
    urlPrefix: "https://",
    scoreOutOf: "/ 100",
    issuesCount: (n: number) => `${n} ghost spots`,
    dropOffRate: (rate: number) => `${rate}% ghosted here`,
  },

  nav: {
    intelligence: "Intelligence",
    howItWorks: "How it works",
    personas: "Personas",
    faq: "FAQ",
    home: "Home",
    signIn: "Sign in",
    signOut: "Sign out",
  },

  footer: {
    description:
      "AI mystery shopper intelligence — see where customers ghost your business.",
    bullets: [
      "Deploy virtual shoppers",
      "Find where customers ghost",
      "Get your Growth Kit",
    ],
    copyright: (year: number) =>
      `© ${year} Ghost AI. All rights reserved.`,
    poweredBy: {
      label: "Powered by",
      brand: "WEBAURA",
      url: "https://webauraindia.com",
    },
  },

  landing: {
    hero: {
      eyebrow:
        "SEE THROUGH YOUR CUSTOMERS' EYES — AI SHOPPER INTELLIGENCE",
      title: "GHOST",
      scannerVersion: "TARGET SCANNER v1.0",
      urlPlaceholder: "Enter store URL or Shopify link...",
      badge: "For E-Commerce & Retail Brands Only",
      description:
        "Paste any link. Ghost summons AI shoppers to walk your site like real customers — finding drop-offs, leaks, and fixes in under 2 minutes.",
    },

    mindset: {
      label: "The Ghost intelligence",
      heading: "The Ghost intelligence",
      pillars: [
        {
          title: "Walk in their shoes.",
          subtitle:
            "If AI shoppers can't finish the journey, your real customers won't either.",
        },
        {
          title: "Ghosting has a cost.",
          subtitle:
            "Every drop-off is revenue walking out the door. Ghost finds where and why.",
        },
        {
          title: "Swarm, don't guess.",
          subtitle:
            "One link. A full swarm of AI shoppers walks your site in minutes — showing you exactly where customers ghost, not where you think they do.",
        },
        {
          title: "Fix it. Ship it.",
          subtitle:
            "Your Growth Kit arrives ready — headlines, CTAs, trust signals, and more.",
        },
      ],
    },

    program: {
      label: "Shape of the system",
      heading: "Shape of the system",
      stepPrefix: (n: number) => `Step ${String(n).padStart(2, "0")}`,
      steps: [
        {
          title: "Scan",
          description:
            "Ghost agents slip into your site, map every page, and trace the paths customers take — and abandon.",
        },
        {
          title: "Deploy",
          description:
            "AI shoppers with real personalities walk pricing, trust, speed, and navigation — just like your visitors would.",
        },
        {
          title: "Report",
          description:
            "Get your Ghost Score, ghost spots on the journey, shopper feedback, and a Growth Kit of fixes you can ship today.",
        },
      ],
    },

  personas: {
    label: "AI shoppers deployed",
    heading: "Shoppers in the wild",
    headingAccent: "Shoppers",
    scrollHint: "Scroll to meet all 5 AI shoppers",
    activeBadge: "On mission",
    items: [
        {
          name: "Budget Buyer",
          problem: "Can't find clear pricing.",
          action:
            "Ghost hunts every page for price transparency and hidden fees.",
        },
        {
          name: "First Time Visitor",
          problem: "No trust signals on homepage.",
          action:
            "Ghost searches for reviews, testimonials, and credibility markers.",
        },
        {
          name: "Premium Customer",
          problem: "Value proposition is unclear.",
          action:
            "Ghost compares your offering against premium expectations.",
        },
        {
          name: "Busy Customer",
          problem: "Site loads too slowly on mobile.",
          action:
            "Ghost times every interaction and flags performance friction.",
        },
        {
          name: "Confused Customer",
          problem: "Navigation is a maze.",
          action:
            "Ghost tests every menu path and documents where shoppers get lost.",
        },
      ],
    },

    finale: {
      label: "Intelligence delivered",
      heading: "Report finale",
      subtitle: "Every scan delivers",
      outcomes: [
        {
          title: "Ghost Score",
          description:
            "A 0–100 rating of how often customers ghost your business — with an animated breakdown.",
        },
        {
          title: "Ghost Spot Detection",
          description:
            "Prioritized places customers disappear — with severity, impact, and step-by-step fixes.",
        },
        {
          title: "Growth Kit",
          description:
            "Instant AI-generated content, CTAs, FAQs, WhatsApp replies, and trust signals.",
        },
      ],
    },

    faq: {
      label: "Got questions?",
      heading: "Got Questions?",
      headingAccent: "Questions?",
      expandIcon: "+",
      items: [
        {
          q: "What websites does Ghost work with?",
          a: "Any public website, Instagram profile, Shopify store, or landing page. Paste the URL — Ghost agents deploy automatically.",
        },
        {
          q: "How long does an analysis take?",
          a: "Under 2 minutes. Watch AI shoppers walk your site in real time before your intelligence report appears.",
        },
        {
          q: "What are AI shopper personas?",
          a: "Ghost creates 5 virtual customers — Budget Buyer, First Time Visitor, Premium Customer, Busy Customer, and Confused Customer — each probing a different reason people ghost.",
        },
        {
          q: "What is the Ghost Score?",
          a: "A 0–100 measure of how healthy your customer journey is — based on drop-offs, ghost spots, trust signals, speed, and UX friction.",
        },
        {
          q: "Can I use the Growth Kit immediately?",
          a: "Yes. Ghost generates ready-to-use copy for headlines, CTAs, FAQs, WhatsApp auto-replies, trust signals, and sales messages.",
        },
        {
          q: "Do I need technical skills?",
          a: "No. Paste a link, watch the mission, get the report. Every fix is plain text — copy, paste, ship.",
        },
      ],
    },

    cta: {
      heading: "Ready to see where customers ghost?",
      description:
        "Paste any link. Watch AI shoppers walk your site. Get the intelligence report.",
    },
  },

  auth: {
    backToHome: "Back to home",
    signInTitle: "Sign in to",
    signInAccent: "Ghost",
    loginToAnalyze: (url: string) =>
      `Sign in to analyze ${url} — Ghost agents are standing by.`,
    emailStepDescription:
      "Enter your email — we'll send a one-time code to summon your session.",
    otpStepDescription: (email: string) =>
      `Enter the 6-digit code we sent to ${email}`,
    emailLabel: "Email address",
    emailPlaceholder: "you@company.com",
    sendCode: "Send login code",
    sending: "Sending...",
    verifying: "Verifying...",
    useDifferentEmail: "Use a different email",
    errors: {
      sendFailed: "Failed to send code.",
      network: "Network error. Please try again.",
      invalidCode: "Invalid code.",
    },
  },

  authApi: {
    invalidEmail: "Please enter a valid email address.",
    tooManyRequests: "Too many requests. Please try again in an hour.",
    devModeTerminal: (email: string) =>
      `Dev mode — check your terminal for the code (${email})`,
    emailNotConfigured: "Email service not configured. Set RESEND_API_KEY.",
    emailSendFailed: "Failed to send email. Check Resend configuration.",
    codeSent: (email: string) => `We sent a 6-digit code to ${email}`,
    invalidEmailOrCode: "Invalid email or code.",
    noActiveCode: "No active code found. Request a new one.",
    codeExpired: "Code expired. Request a new one.",
    incorrectCode: "Incorrect code. Please try again.",
    signedIn: "Signed in successfully.",
    somethingWrong: "Something went wrong.",
    emailRequired: "Email is required",
    authRequired: "Authentication required",
    urlRequired: "URL is required",
    missionFailed: "Failed to start mission",
    missionIdRequired: "missionId is required",
    missionNotFound: "Mission not found",
    reportNotFound: "Report not found",
  },

  email: {
    subject: (code: string) => `${code} is your Ghost login code`,
    text: (code: string) =>
      `Your Ghost login code is ${code}. It expires in 10 minutes. If you didn't request this, ignore this email.`,
    heading: "Your login code",
    body: "Enter this code to sign in to Ghost. It expires in 10 minutes.",
    footer: "If you didn't request this code, you can safely ignore this email.",
  },

  mission: {
    reportReady: "Report ready",
    missionActive: "Mission active",
    intelligenceReady: "Intelligence report ready",
    agentsDeployed: "Agents deployed",
    title: "Ghost agents",
    titleAccent: "in motion",
    missionComplete: "Mission complete",
    missionProgress: "Mission progress",
    compilingReport: "Compiling intelligence report...",
    notFound: "Mission not found",
    shoppersActive: "AI shoppers active",
    analyzingFallback: "Analyzing...",
    failed: {
      heading: "The scan hit a snag",
      body: "Ghost couldn't finish auditing this site.",
      retry: "Try again",
      scanAnother: "Scan another site",
    },
  },

  stages: [
    {
      id: "opening" as MissionStage,
      label: "Summoning Ghost agents",
      description: "Agents are slipping into your site — rendering every page",
      duration: 4500,
    },
    {
      id: "understanding" as MissionStage,
      label: "Reading the business",
      description:
        "Ghost is decoding your value proposition and how customers should convert",
      duration: 5500,
    },
    {
      id: "personas" as MissionStage,
      label: "Creating shopper personas",
      description:
        "Building AI customers with real motivations — budget, trust, speed, confusion",
      duration: 4500,
    },
    {
      id: "deploying" as MissionStage,
      label: "Deploying AI shoppers",
      description:
        "Virtual customers are walking your site — clicking, scrolling, deciding",
      duration: 4000,
    },
    {
      id: "testing" as MissionStage,
      label: "Walking the journey",
      description:
        "Shoppers are testing every path — where they hesitate, where they ghost",
      duration: 6500,
    },
    {
      id: "leaks" as MissionStage,
      label: "Detecting ghost spots",
      description:
        "Mapping every place customers disappear — and why they leave",
      duration: 5000,
    },
    {
      id: "generating" as MissionStage,
      label: "Building your Growth Kit",
      description:
        "Compiling Ghost Score, ghost spots, shopper thoughts, and fixes",
      duration: 4000,
    },
  ],

  scan: {
    phases: {
      connecting: "Summoning Ghost agents...",
      fetching: "Shoppers entering your website...",
      rendering: "Walking through pages like real customers...",
      live: "Live scan — shoppers on-site",
      fallback: "Running stealth headless analysis...",
    },
    iframeTitle: "Live site scan",
    previewAlt: (domain: string) => `Preview of ${domain}`,
    elementsScanned: "Elements scanned",
    terminalLabel: "Ghost terminal",
    terminalPrompt: ">",
    analysisSteps: [
      { label: "HEADER", desc: "First impression audit" },
      { label: "HERO CTA", desc: "Will shoppers click?" },
      { label: "NAV MENU", desc: "Can they find their way?" },
      { label: "CONTENT", desc: "Does the message land?" },
      { label: "SOCIAL PROOF", desc: "Trust signal scan" },
      { label: "FOOTER", desc: "Exit path check" },
      { label: "FORM", desc: "Friction & validation scan" },
    ],
    stageLogs: {
      opening: [
        "Summoning Ghost agents to target...",
        "Establishing secure connection...",
        "Shoppers entering the front door...",
        "Reading page structure like a customer would...",
        "Loading styles, images, and scripts...",
        "Site rendered — agents are inside.",
      ],
      understanding: [
        "What does this business actually sell?",
        "Decoding the value proposition...",
        "Tracing primary conversion paths...",
        "Mapping how visitors should navigate...",
        "Hunting for pricing and CTA patterns...",
        "Business context locked in.",
      ],
      personas: [
        "Who shops here — and why do they leave?",
        "Spawning Budget Buyer persona...",
        "Spawning First Time Visitor persona...",
        "Spawning Premium Customer persona...",
        "Calibrating shopper behaviors...",
        "Five AI shoppers ready to deploy.",
      ],
      deploying: [
        "Opening virtual browser swarm...",
        "Injecting AI shoppers into the site...",
        "Budget Buyer heading to pricing...",
        "First Time Visitor checking trust signals...",
        "Busy Customer testing page speed...",
        "All shoppers walking the site.",
      ],
      testing: [
        "Simulating add-to-cart journey...",
        "Testing mobile — would they stay?",
        "Measuring hesitation at every step...",
        "Recording where shoppers pause...",
        "Evaluating form friction...",
        "Stress-testing the checkout path...",
      ],
      leaks: [
        "Cross-referencing drop-off signals...",
        "Found it — pricing isn't visible enough...",
        "Trust signals missing on key pages...",
        "Navigation dead-end detected...",
        "Quantifying revenue impact...",
        "Ghost spots ranked by severity.",
      ],
      generating: [
        "Calculating Ghost Score...",
        "Writing shopper feedback...",
        "Building Growth Kit recommendations...",
        "Mapping the customer journey...",
        "Finalizing intelligence report...",
        "Report ready — customers won't ghost unnoticed.",
      ],
    } satisfies Record<MissionStage, string[]>,
  },

  severity: {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  },

  results: {
    intelligenceReady: "Intelligence report ready",
    reportNotFound: "Report not found",
    narrateReport: "Narrate report",
    stopSpeech: "Stop speech",
    downloadPdf: "Download PDF",
    scanAnotherHeading: "Scan another",
    scanAnotherAccent: "site?",
    ghostScore: "Ghost Score",
    scoreLabels: {
      excellent: "Customers stick around",
      needsWork: "Shoppers are ghosting",
      critical: "Major ghost spots",
      urgent: "Customers are leaving fast",
    },
    businessUnderstanding: {
      label: "Business understanding",
      heading: "What Ghost detected",
      businessType: "Business Type",
      targetAudience: "Target Audience",
      primaryGoal: "Primary Goal",
      expectations: "Customer expectations",
    },
    journey: {
      label: "Customer journey",
      heading: "Where customers ghost",
      conversionLeak: "Ghost spot",
      stepSeparator: " › ",
    },
    leaks: {
      label: "Ghost spots",
      heading: "Places customers ghost",
      whatsWrong: "What's wrong",
      whyTheyGhost: "Why customers ghost",
      howToFix: "How to fix it",
    },
    growthKit: {
      label: "Growth Kit",
      heading: "Your",
      headingAccent: "Growth Kit",
      subtitle: "Ghost found the problems. Here are the fixes.",
      regenerate: "Regenerate fix",
      copyFix: "Copy fix",
      copiedFix: "Copied!",
      rescan: "Rescan site",
      rescanDescription: "Send Ghost agents back for a fresh walk-through.",
    },
    narration: {
      summary: (domain: string, score: number) =>
        `Here is your Ghost intelligence report for ${domain}. Your Ghost Score is ${score} out of 100.`,
      leaksFound: (count: number, details: string) =>
        `Ghost found ${count} places where customers ghost your business. ${details}`,
      noLeaks: "No critical ghost spots were detected.",
      leakItem: (index: number, title: string, detail: string) =>
        `Ghost spot ${index}: ${title}. ${detail}`,
    },
  },

  personas: {
    defaults: [
      {
        id: "budget-buyer",
        name: "Budget Buyer",
        type: "Price-conscious shopper",
        avatar: "💰",
        status: "Hunting for pricing",
        thought:
          "Where's the pricing? I need to know if this fits my budget...",
        location: "Pricing page",
      },
      {
        id: "first-time",
        name: "First Time Visitor",
        type: "Trust seeker",
        avatar: "🔍",
        status: "Checking trust",
        thought:
          "Is this company legit? I don't see any reviews or testimonials...",
        location: "Homepage",
      },
      {
        id: "premium",
        name: "Premium Customer",
        type: "Value comparator",
        avatar: "✨",
        status: "Weighing value",
        thought:
          "What makes this premium? I need to see the differentiation...",
        location: "Features page",
      },
      {
        id: "busy",
        name: "Busy Customer",
        type: "Speed tester",
        avatar: "⚡",
        status: "Testing speed",
        thought:
          "This page is taking forever. I don't have time — I'm ghosting.",
        location: "Checkout",
      },
      {
        id: "confused",
        name: "Confused Customer",
        type: "Navigation tester",
        avatar: "🧭",
        status: "Lost in navigation",
        thought:
          "I can't find what I'm looking for. The menu is a maze...",
        location: "Navigation",
      },
    ],
    runtimeThoughts: {
      "budget-buyer": [
        "Where's the pricing? I need to know if this fits my budget...",
        "Found pricing but it's buried in the menu...",
        "No comparison table? Hard to justify the cost...",
        "Pricing is unclear — are there hidden fees?",
        "I'd buy if there was a clear price breakdown...",
      ],
      "first-time": [
        "Is this company legit? I don't see any reviews...",
        "Looking for testimonials or social proof...",
        "No trust badges on the checkout page...",
        "The about page is empty — who are these people?",
        "I need more reassurance before I'd purchase...",
      ],
      premium: [
        "What makes this premium? I need to see differentiation...",
        "Comparing features with competitors...",
        "The quality signals aren't strong enough...",
        "Premium pricing but budget presentation...",
        "Where's the exclusive value proposition?",
      ],
      busy: [
        "This page is taking forever to load...",
        "Still waiting... 4 seconds and counting",
        "Mobile experience is painfully slow",
        "Images aren't optimized — killing my data",
        "I'd have ghosted by now on a real site",
      ],
      confused: [
        "I can't find what I'm looking for...",
        "The menu has too many options",
        "Where is the FAQ? Where is contact?",
        "I clicked three links and got lost",
        "Navigation is a maze — ghosting this site",
      ],
    },
    runtimeLocations: {
      "budget-buyer": [
        "Homepage",
        "Menu",
        "Pricing page",
        "Pricing page",
        "Exit — ghosted",
      ],
      "first-time": [
        "Homepage",
        "About page",
        "Reviews",
        "Checkout",
        "Exit — ghosted",
      ],
      premium: [
        "Homepage",
        "Features",
        "Comparison",
        "Product page",
        "Exit — ghosted",
      ],
      busy: [
        "Homepage",
        "Product page",
        "Cart",
        "Checkout",
        "Exit — ghosted",
      ],
      confused: [
        "Homepage",
        "Navigation",
        "Search",
        "404 page",
        "Exit — ghosted",
      ],
    },
    browsingFallback: "Browsing",
  },

  mock: {
    businessUnderstanding: {
      businessType: "E-commerce / D2C Brand",
      targetAudience:
        "Millennials & Gen-Z seeking premium lifestyle products",
      primaryGoal: "Drive online purchases through product discovery",
      customerExpectations: [
        "Clear pricing with no hidden fees",
        "Fast page load under 3 seconds",
        "Social proof and customer reviews",
        "Easy checkout with multiple payment options",
        "Mobile-optimized shopping experience",
      ],
    },
    journey: [
      { id: "visitor", label: "Visitor", description: "Discovers your site" },
      {
        id: "homepage",
        label: "Homepage",
        description: "First impression — stay or ghost?",
        dropOffRate: 15,
      },
      {
        id: "interest",
        label: "Interest",
        description: "Browsing products & content",
        dropOffRate: 28,
        hasLeak: true,
        leakReason: "No clear CTA above the fold",
      },
      {
        id: "decision",
        label: "Decision",
        description: "Weighing the purchase",
        dropOffRate: 42,
        hasLeak: true,
        leakReason: "Missing trust signals & reviews",
      },
      {
        id: "action",
        label: "Action",
        description: "Completing purchase",
        dropOffRate: 35,
        hasLeak: true,
        leakReason: "Complex checkout flow",
      },
    ],
    leaks: [
      {
        id: "leak-1",
        title: "No Clear Value Proposition Above the Fold",
        severity: "critical" as const,
        whatIsWrong:
          "Visitors land on your homepage but can't tell what you sell or why they should care — within the first 3 seconds.",
        whyCustomersLeave:
          "First-time visitors ghost fast. Without a clear headline and visual, 68% bounce before scrolling.",
        impact: "Estimated 23% revenue loss from homepage ghosting",
        howToFix:
          "Add a compelling headline stating your unique value, a supporting subheadline, and a prominent CTA above the fold.",
        category: "Content",
      },
      {
        id: "leak-2",
        title: "Missing Social Proof & Trust Signals",
        severity: "high" as const,
        whatIsWrong:
          "No customer reviews, testimonials, or trust badges visible on product pages or checkout.",
        whyCustomersLeave:
          "Premium Customer ghosted at the decision stage. Without social proof, perceived risk skyrockets.",
        impact: "Estimated 18% drop in conversion at decision stage",
        howToFix:
          "Add testimonials, star ratings, 'As seen in' logos, and security badges near the purchase button.",
        category: "Trust",
      },
      {
        id: "leak-3",
        title: "Slow Page Load on Mobile",
        severity: "high" as const,
        whatIsWrong:
          "Mobile pages take 5.2 seconds to become interactive. Images are unoptimized and scripts block rendering.",
        whyCustomersLeave:
          "Busy Customer ghosted after 3 seconds. 53% of mobile users leave sites that take over 3 seconds.",
        impact: "Estimated 15% mobile traffic loss",
        howToFix:
          "Compress images to WebP, lazy-load assets, defer non-critical JavaScript, enable CDN caching.",
        category: "Performance",
      },
      {
        id: "leak-4",
        title: "Confusing Navigation Structure",
        severity: "medium" as const,
        whatIsWrong:
          "Menu has 12 top-level items with unclear labels. Shoppers can't find pricing, FAQ, or contact.",
        whyCustomersLeave:
          "Confused Customer spent 45 seconds searching for pricing before ghosting. Poor IA increases bounce by 35%.",
        impact: "Estimated 12% navigation-related ghosting",
        howToFix:
          "Simplify to 5–6 clear categories. Add sticky header with search and a prominent 'Pricing' link.",
        category: "UX",
      },
      {
        id: "leak-5",
        title: "Weak Call-to-Action Buttons",
        severity: "medium" as const,
        whatIsWrong:
          "CTAs use generic text like 'Submit' and 'Click Here' with low contrast against the background.",
        whyCustomersLeave:
          "Shoppers don't know what to do next. Weak CTAs reduce click-through by up to 40%.",
        impact: "Estimated 10% CTA-related conversion loss",
        howToFix:
          "Use action copy like 'Start Free Trial' or 'Get My Quote'. Increase button size and contrast.",
        category: "Conversion",
      },
    ],
    fixes: [
      {
        id: "fix-content",
        category: "Website Content",
        title: "AI-Generated Hero Copy",
        description: "Optimized headline and subheadline for your homepage",
        icon: "📝",
        content:
          'Headline: "Premium Lifestyle Products — Crafted for the Modern You"\n\nSubheadline: "Discover curated collections that elevate your everyday. Free shipping on orders over $50. Join 10,000+ happy customers."\n\nCTA: "Shop the Collection →"',
      },
      {
        id: "fix-cta",
        category: "CTA Buttons",
        title: "High-Converting CTA Copy",
        description: "Action-oriented button text replacements",
        icon: "🎯",
        content:
          'Replace "Submit" → "Get Started Free"\nReplace "Click Here" → "See Pricing Plans"\nReplace "Learn More" → "Explore Features →"\nReplace "Buy Now" → "Add to Cart — Free Shipping"',
      },
      {
        id: "fix-faq",
        category: "FAQ Generation",
        title: "AI-Generated FAQ Section",
        description: "Answers to questions your customers actually ask",
        icon: "❓",
        content:
          "Q: What is your return policy?\nA: We offer hassle-free 30-day returns. Simply contact support and we'll send a prepaid label.\n\nQ: How long does shipping take?\nA: Standard shipping: 3-5 business days. Express: 1-2 business days.\n\nQ: Do you ship internationally?\nA: Yes! We ship to 40+ countries with duties included at checkout.",
      },
      {
        id: "fix-whatsapp",
        category: "WhatsApp Auto Replies",
        title: "Smart WhatsApp Responses",
        description: "Automated replies for common customer inquiries",
        icon: "💬",
        content:
          'Greeting: "Hi! 👋 Thanks for reaching out to [Brand]. I\'m your AI assistant. How can I help you today?"\n\nPricing inquiry: "Our plans start at $29/mo. Would you like me to send you our pricing page?"\n\nOrder status: "I can help track your order! Please share your order number and I\'ll check right away."',
      },
      {
        id: "fix-trust",
        category: "Trust Improvement",
        title: "Trust Signal Package",
        description: "Social proof elements to add immediately",
        icon: "🛡️",
        content:
          'Add below hero: "Trusted by 10,000+ customers" with avatar stack\n\nAdd to product pages: "★★★★★ 4.8/5 from 2,341 reviews"\n\nAdd to checkout: SSL badge + "Secure 256-bit encryption" + "30-day money-back guarantee"\n\nAdd press logos: "As featured in TechCrunch, Forbes, Wired"',
      },
      {
        id: "fix-sales",
        category: "Sales Messages",
        title: "Conversion-Optimized Sales Copy",
        description: "Persuasive messaging for key touchpoints",
        icon: "💎",
        content:
          'Cart abandonment: "Your items are waiting! Complete your order in the next 15 minutes and get free express shipping."\n\nExit intent: "Wait! Get 10% off your first order. Enter your email below."\n\nPost-purchase: "Thank you! Your order is confirmed. Share your experience and earn $10 credit."',
      },
    ],
  },

  ui: {
    glowInputPlaceholder:
      "Paste your website, Instagram, or business link...",
  },
} as const;

/** Build MISSION_STAGES for runtime use (preserves duration for simulation) */
export function getMissionStages() {
  return copy.stages.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    duration: s.duration,
  }));
}

/** Ghost Score label from numeric score */
export function getScoreLabel(score: number): string {
  if (score >= 80) return copy.results.scoreLabels.excellent;
  if (score >= 60) return copy.results.scoreLabels.needsWork;
  if (score >= 40) return copy.results.scoreLabels.critical;
  return copy.results.scoreLabels.urgent;
}

/** Persona thought by id + progress */
export function getPersonaThought(personaId: string, progress: number): string {
  const thoughts =
    copy.personas.runtimeThoughts[
      personaId as keyof typeof copy.personas.runtimeThoughts
    ];
  const list = thoughts ?? [copy.mission.analyzingFallback];
  const index = Math.min(Math.floor(progress / 20), list.length - 1);
  return list[index];
}

/** Persona location by id + progress */
export function getPersonaLocation(
  personaId: string,
  progress: number
): string {
  const locations =
    copy.personas.runtimeLocations[
      personaId as keyof typeof copy.personas.runtimeLocations
    ];
  const list = locations ?? [copy.personas.browsingFallback];
  const index = Math.min(Math.floor(progress / 20), list.length - 1);
  return list[index];
}

export type Copy = typeof copy;
