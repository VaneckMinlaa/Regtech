import bulbIcon from "../assets/bulb.svg";
import chatIcon from "../assets/chat.svg";
import crownIcon from "../assets/crown.svg";
import lightningIcon from "../assets/lightning-bolt.svg";
import pencilIcon from "../assets/pencil.svg";
import robotIcon from "../assets/robot.svg";

export const CORE_FEATURES = [
  {
    title: "AfCFTA tariff simulation",
    description:
      "Estimate duties, VAT, and preferential taxes in just a few clicks based on origin and destination.",
    iconUrl: pencilIcon,
  },
  {
    title: "Smart rules of origin",
    description:
      "Check AfCFTA eligibility and the local value-added threshold for your products.",
    iconUrl: bulbIcon,
  },
  {
    title: "AI-assisted HS classification",
    description:
      "Find the right customs code with AI, with a clear confidence indicator.",
    iconUrl: robotIcon,
  },
  {
    title: "Multi-destination comparison",
    description:
      "Compare the fiscal cost of your shipments to multiple African countries on a single screen.",
    iconUrl: chatIcon,
  },
  {
    title: "Exports & pro-forma certificates",
    description:
      "Generate PDF and TXT summaries ready to share with your logistics partners.",
    iconUrl: crownIcon,
  },
  {
    title: "Batch processing",
    description:
      "Import your CSV or Excel catalogs to simulate hundreds of lines in one run.",
    iconUrl: lightningIcon,
  },
];

export const TOOL_TABS = [
  {
    id: "simulator",
    label: "Tariff simulator",
    lightImage: "/landing/tab-image/tab-image-1.jpg",
    darkImage: "/landing/tab-image/tab-image-1-dark.jpg",
    title: "The easiest way to estimate your duties",
    description:
      "Enter origin, destination, value, and HS code to get a clear breakdown of applicable taxes.",
  },
  {
    id: "classifier",
    label: "HS classification",
    lightImage: "/landing/tab-image/tab-image-2.jpg",
    darkImage: "/landing/tab-image/tab-image-2-dark.jpg",
    title: "Classify your products with AI",
    description:
      "Describe your goods in natural language and get a proposal for the harmonized classification.",
  },
  {
    id: "afcfta",
    label: "AfCFTA rules",
    lightImage: "/landing/tab-image/tab-image-3.jpg",
    darkImage: "/landing/tab-image/tab-image-3-dark.jpg",
    title: "Check preferential eligibility",
    description:
      "Analyze tariff dismantling schedules and sensitive exclusions by year.",
  },
  {
    id: "batch",
    label: "Batch processing",
    lightImage: "/landing/tab-image/tab-image-4.jpg",
    darkImage: "/landing/tab-image/tab-image-4-dark.jpg",
    title: "Process your catalogs in bulk",
    description:
      "Upload a structured file and run grouped simulations for your entire product range.",
  },
  {
    id: "checklist",
    label: "Cameroon import checklist",
    lightImage: "/landing/tab-image/tab-image-5.jpg",
    darkImage: "/landing/tab-image/tab-image-5-dark.jpg",
    title: "Guide your imports step by step",
    description:
      "Follow the e-GUCE / CAMCIS journey with an interactive checklist built for SMEs.",
  },
];

export const FAQ_ITEMS = [
  {
    id: 1,
    question: "Does RegTech replace CAMCIS or SIMPA?",
    answer:
      "No. RegTech provides estimates and decision-support analysis. Only the final settlement performed on official customs systems is authoritative.",
  },
  {
    id: 2,
    question: "Which countries are covered?",
    answer:
      "The platform covers AfCFTA markets with multi-country reference data, multi-destination comparisons, and a dedicated tax module for Cameroon.",
  },
  {
    id: 3,
    question: "Can I change my plan at any time?",
    answer:
      "Yes. You can upgrade from the Subscriptions area. Mobile Money payments via PawaPay are available in supported countries.",
  },
  {
    id: 4,
    question: "What does the Free plan include?",
    answer:
      "The Free plan lets you try the simulator and HS classification with limited monthly quotas—perfect to test the tool before subscribing.",
  },
  {
    id: 5,
    question: "Is my data secure?",
    answer:
      "Authentication is handled by Clerk. Simulations and history are tied to your account, and API communication is encrypted in transit.",
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Aminata Diallo",
    company: "AgroExport Sénégal",
    image: "/landing/users/user-1.png",
    testimonial:
      "We compare three destinations in a few minutes. RegTech saves us precious time before every shipment.",
  },
  {
    id: 2,
    name: "Kwame Mensah",
    company: "Accra Trade Hub",
    image: "/landing/users/user-2.png",
    testimonial:
      "AI-assisted HS classification helped us fix incorrect codes across our entire textile catalog.",
  },
  {
    id: 3,
    name: "Fatou Ndiaye",
    company: "Dakar Logistics",
    image: "/landing/users/user-3.png",
    testimonial:
      "Batch processing has become essential for our customer quotes. Clear interface and actionable results.",
  },
  {
    id: 4,
    name: "Jean-Pierre Nkomo",
    company: "Douala Import PME",
    image: "/landing/users/user-4.png",
    testimonial:
      "The Cameroon import checklist structures our team along the e-GUCE journey. A real assistant for our first imports.",
  },
  {
    id: 5,
    name: "Grace Okafor",
    company: "Lagos Commodities Ltd",
    image: "/landing/users/user-1.png",
    testimonial:
      "Pro-forma certificates make it easier to work with the bank and our logistics partners.",
  },
  {
    id: 6,
    name: "Samuel Ebot",
    company: "CEMAC Freight",
    image: "/landing/users/user-2.png",
    testimonial:
      "Finally, an AfCFTA tool designed for African SMEs, with pricing accessible via Mobile Money.",
  },
];
