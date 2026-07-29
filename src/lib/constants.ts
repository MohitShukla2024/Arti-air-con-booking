export const BRAND_INFO = {
  name: "Arti Air Con",
  tagline: "Professional AC Services",
  subTagline: "Professional Digital Cooling Solutions",
  phone: "+91 9264173334",
  phoneRaw: "+919264173334",
  whatsapp: "+91 8271876176",
  emergencyPhone: "8271657738",
  email: "info@artiair.com",
  address: "Aaya nagar, sunday-market road, H block, phase-6, Bandh road-Market",
  location: "Delhi",
  yearsExperience: "15+",
};

export const NAV_LINKS = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/#services" },
  { name: "Pricing", href: "/#pricing" },
  { name: "About Us", href: "/#about" },
  { name: "FAQ", href: "/#faq" },
  { name: "Contact Us", href: "/#contact" },
];

export const SERVICES_LIST = [
  { id: "window-ac", icon: "AppWindow", title: "Window AC Service", price: "Starting at ₹400", description: "Deep foam jet wash, drain pipe unclogging & deodorizing for fresh airflow." },
  { id: "ac-uninstallation", icon: "Archive", title: "AC Uninstallation", price: "Starting at ₹600", description: "Safe refrigerant lock-in, pipe disconnection & damage-free wall removal." },
  { id: "pcb-circuit-repair", icon: "Cpu", title: "PCB Circuit Repair", price: "", description: "Inverter AC circuit board micro-soldering & error code diagnostic repair." },
  { id: "compressor-replacement", icon: "Settings", title: "Compressor Replacement", price: "", description: "Genuine sealed compressor motor replacement with vacuum pressure testing." },
  { id: "fan-motor-repair", icon: "Fan", title: "Fan Motor Repair", price: "", description: "Blower motor bearing lubrication, capacitor replacement & noise elimination." },
  { id: "capacitor-replacement", icon: "Zap", title: "Capacitor Replacement", price: "Starting at ₹950", description: "Heavy-duty dual run capacitor replacement for instant compressor start." },
  { id: "annual-amc-package", icon: "ShieldCheck", title: "Annual AMC Package (Full Year)", price: "Starting at ₹1,300", description: "Full annual coverage, unlimited breakdown calls & free maintenance services." },
  { id: "vrv-ac-service", icon: "Building2", title: "VRV AC Service", price: "Starting at ₹1,300 / AC", description: "Advanced Variable Refrigerant Volume HVAC system servicing & diagnostic." },
  { id: "commercial-services", icon: "Building", title: "Commercial Services", price: "Starting at ₹1,250", description: "Bulk Cassette & Ductable HVAC maintenance for offices, restaurants & retail." },
  { id: "tower-ac-service", icon: "Server", title: "Tower AC Service", price: "Starting at ₹1,250", description: "Floor standing Tower AC deep jet wash, filter cleaning & air throw restoration." },
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
    location: "DLF Phase 5, Aaya nagar, Delhi",
    rating: 5,
    date: "1 week ago",
    comment: "Transparent pricing with zero hidden costs. They showed me the pressure gauge reading before and after filling gas. Highly professional team!",
    service: "Gas Charging & Leakage Sealing",
  },
  {
    id: "3",
    name: "Amit Patel",
    location: "Golf Course Road, Budh Vihar",
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
  "Window AC Service",
  "AC Uninstallation",
  "PCB Circuit Repair",
  "Compressor Replacement",
  "Fan Motor Repair",
  "Capacitor Replacement",
  "Annual AMC Package (Full Year)",
  "VRV AC Service",
  "Commercial Services",
  "Tower AC Service",
];
export const AC_TYPE_OPTIONS = ["Split AC", "Window AC", "Cassette AC", "Tower AC", "Ductable HVAC"];
export const AC_BRAND_OPTIONS = ["Daikin", "Voltas", "LG", "Samsung", "Blue Star", "Carrier", "Other"];

