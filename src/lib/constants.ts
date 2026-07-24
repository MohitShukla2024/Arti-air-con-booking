export const BRAND_INFO = {
  name: "Arti Air Con",
  tagline: "Professional AC Services",
  subTagline: "Professional Digital Cooling Solutions",
  phone: "+91 9264173334",
  phoneRaw: "+919264173334",
  whatsapp: "+91 8271876176",
  emergencyPhone: "8271657738",
  email: "info@artiairco.com",
  address: "Aaya nagar, sunday-market road, H block, phase-6, Bandh road-Market",
  location: "Gurgaon",
  yearsExperience: "15+",
};

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/#services" },
  { name: "Pricing", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
];

export const SERVICES_LIST = [
  { id: "split-ac", icon: "Snowflake", title: "Split AC Service", price: "Starting at ₹450", description: "High-pressure jet pump cleaning for coil dirt removal & 30% faster cooling." },
  { id: "window-ac", icon: "AppWindow", title: "Window AC Service", price: "Starting at ₹450", description: "Deep foam jet wash, drain pipe unclogging & deodorizing for fresh airflow." },
  { id: "commercial-ac", icon: "Building2", title: "Commercial AC", price: "Custom Quote", description: "Bulk Cassette & Ductable HVAC maintenance for offices, restaurants & retail." },
  { id: "ac-installation", icon: "Wrench", title: "AC Installation", price: "Starting at ₹1,200", description: "Precision wall mounting, copper piping setup & gas leak testing guarantee." },
  { id: "gas-filling", icon: "Gauge", title: "Gas Filling", price: "Starting at ₹1,200", description: "100% pure R32 / R410a refrigerant top-up with pressure gauge verification." },
  { id: "deep-cleaning", icon: "Sparkles", title: "Deep Cleaning", price: "Starting at ₹599", description: "Anti-bacterial chemical jet wash removing 99.9% dust & mold build-up." },
  { id: "pcb-repair", icon: "Cpu", title: "PCB Repair", price: "Starting at ₹850", description: "Inverter AC circuit board micro-soldering & error code diagnostic repair." },
  { id: "leakage-repair", icon: "Droplets", title: "Leakage Repair", price: "Starting at ₹399", description: "Indoor water dripping fix, insulation wrapping & tray drain line sealing." },
  { id: "performance-check", icon: "Activity", title: "Performance Check", price: "Starting at ₹299", description: "Complete 21-point thermal inspection, voltage testing & health report." },
  { id: "condenser-repair", icon: "Fan", title: "Condenser Repair", price: "Starting at ₹750", description: "Outdoor unit fin straightening, fan coil repair & heat exchange restore." },
  { id: "fan-motor-repair", icon: "Settings", title: "Fan Motor Repair", price: "Starting at ₹650", description: "Blower motor bearing lubrication, capacitor replacement & noise elimination." },
  { id: "uninstallation", icon: "Archive", title: "Uninstallation", price: "Starting at ₹599", description: "Safe refrigerant lock-in, pipe disconnection & damage-free wall removal." },
];

export const PRICING_PLANS = [
  {
    id: "ac-service",
    badge: "Essential Maintenance",
    title: "AC Service",
    price: "₹450",
    unit: "/Unit",
    features: ["Filter Cleaning", "Cooling Coil Cleaning", "Drain Pipe Flush"],
    inclusions: ["High-Pressure Jet Washing", "Blower & Grill Cleaning", "Gas Pressure Inspection", "30-Day Service Warranty"],
    exclusions: ["Refrigerant Top-up (Charged extra)", "Electrical PCB Replacement"],
    featured: false,
    ctaText: "Book Service",
  },
  {
    id: "ac-installation",
    badge: "Most Popular",
    subBadge: "New Unit Setup",
    title: "AC Installation",
    price: "₹1200",
    unit: "/Unit",
    features: ["Secure Mounting", "Gas Leak Check", "Electrical Connection", "Final Testing"],
    inclusions: ["Indoor & Outdoor Wall Mounting", "Copper Pipe Vacuum & Bending", "3-Meter Drain Line Connection", "Free Operation Demo"],
    exclusions: ["Extra Copper Pipe (>3m)", "Outdoor Unit Wall Stand (₹750 extra)"],
    featured: true,
    ctaText: "Book Now",
  },
  {
    id: "ac-repair",
    badge: "Expert Troubleshooting",
    title: "AC Repair",
    price: "Quote",
    unit: "/Base",
    description: "Repair cost depends on the specific fault and required spare parts. We provide a clear estimate after inspection.",
    inclusions: ["Complete 21-Point System Diagnosis", "Detailed Component Cost Estimate", "Warranted Technician Labor"],
    exclusions: ["Replacement Spare Parts (Billed as per MRP)"],
    featured: false,
    ctaText: "Request Quote",
  },
  {
    id: "amc-annual",
    badge: "Maximum Savings",
    subBadge: "Annual Membership",
    title: "Annual AMC Package",
    price: "₹2,999",
    unit: "/Year (2 ACs)",
    features: [
      "2 Free Wet Jet Services/Year",
      "Unlimited Breakdown Repairs",
      "50% Off Spare Parts & Gas Refills",
      "Priority 15-Min Response Window",
    ],
    inclusions: ["Full Annual Coverage for 2 Split/Window ACs", "Free Gas Leak Repair", "Free Capacitor Replacement"],
    exclusions: ["Compressor Replacement (>5 HP)"],
    featured: true,
    ctaText: "Subscribe AMC Plan",
  },
];

export const TESTIMONIALS_LIST = [
  {
    id: "1",
    name: "Rahul Sharma",
    location: "Sector 56, Gurgaon",
    rating: 5,
    date: "2 days ago",
    comment: "Technician Ahmad arrived within 25 minutes during peak heat wave. Fixed the gas leak and jet-cleaned my Split AC perfectly. Excellent service!",
    service: "Split AC Jet Cleaning & Gas Refill",
  },
  {
    id: "2",
    name: "Priya Verma",
    location: "DLF Phase 5, Gurgaon",
    rating: 5,
    date: "1 week ago",
    comment: "Transparent pricing with zero hidden costs. They showed me the pressure gauge reading before and after filling gas. Highly professional team!",
    service: "Gas Charging & Leakage Sealing",
  },
  {
    id: "3",
    name: "Amit Patel",
    location: "Golf Course Road, Gurgaon",
    rating: 5,
    date: "2 weeks ago",
    comment: "Installed 3 new Daikin AC units at my workplace. Neat wiring, proper vacuuming, and great behavior. Recommended for commercial & residential setup.",
    service: "Multi-Unit AC Installation",
  },
];

export const PROCESS_STEPS = [
  { step: 1, title: "Book Service", description: "Choose your service and preferred time slot online or via call.", icon: "CalendarCheck" },
  { step: 2, title: "Confirmation", description: "Receive instant confirmation and technician details via SMS.", icon: "MailCheck" },
  { step: 3, title: "Service Visit", description: "Our certified technician arrives on time to fix your AC.", icon: "Home" },
  { step: 4, title: "Enjoy Cool Air", description: "Pay after completion and enjoy a perfectly chilled space.", icon: "CheckCircle2" },
];

export const FAQ_LIST = [
  {
    question: "How often should I service my AC?",
    answer: "For optimal performance and energy efficiency, we recommend servicing your AC every 6 months, especially before and after the peak summer season.",
  },
  {
    question: "Do you provide original spare parts?",
    answer: "Yes, we exclusively use 100% genuine and brand-specific spare parts to ensure the longevity and safety of your cooling unit.",
  },
  {
    question: "Is there any warranty on repairs?",
    answer: "Absolutely. We provide a 30-day service warranty and manufacturer warranties on all replaced spare parts.",
  },
];

export const SERVICE_OPTIONS = [
  "Jet Cleaning",
  "Gas Refill",
  "Installation",
  "Full Repair",
  "Annual AMC Contract",
  "Corporate Bulk Servicing",
];
export const AC_TYPE_OPTIONS = ["Split AC", "Window AC", "Cassette AC", "Tower AC", "Ductable HVAC"];
export const AC_BRAND_OPTIONS = ["Daikin", "Voltas", "LG", "Samsung", "Blue Star", "Carrier", "Other"];

