export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type LegalPageContent = {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

const LAST_UPDATED = "July 29, 2026";

export const TERMS_OF_USE: LegalPageContent = {
  title: "Terms of Use",
  lastUpdated: LAST_UPDATED,
  intro:
    "These Terms of Use govern your access to and use of the Arti Air Con website, customer login portal, booking platform, and related services. By using our platform, you agree to these terms.",
  sections: [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      paragraphs: [
        "By accessing artiair.com, creating a customer account, or booking a service through Arti Air Con, you confirm that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy.",
        "If you do not agree with any part of these terms, please do not use our website or booking services.",
      ],
    },
    {
      id: "booking-rules",
      title: "2. Booking Rules",
      paragraphs: [
        "Service bookings must be submitted with accurate contact details, service address, AC type, and preferred date and time slot.",
        "Each booking is subject to technician availability in your service area. We may contact you by phone, SMS, or WhatsApp to confirm or reschedule your appointment.",
        "You must be present at the service location during the scheduled visit, or arrange for an authorized adult to provide access to the AC unit.",
      ],
    },
    {
      id: "service-availability",
      title: "3. Service Availability",
      paragraphs: [
        "Arti Air Con provides AC repair, maintenance, installation, and related services in the areas we currently cover. Service availability may vary by location, season, and technician schedule.",
        "We strive to offer same-day and emergency service where possible, but we do not guarantee arrival within a specific time window in all circumstances.",
      ],
    },
    {
      id: "pricing-disclaimer",
      title: "4. Pricing Disclaimer",
      paragraphs: [
        "Prices displayed on our website are indicative starting rates for standard services. Final charges may vary based on AC brand, model, condition, access requirements, and additional work discovered during inspection.",
        "Any price shown online is not a final invoice unless explicitly stated at the time of booking confirmation.",
      ],
    },
    {
      id: "repair-charges",
      title: "5. Repair Charges",
      paragraphs: [
        "Repair services often require on-site diagnosis before a final cost can be determined. Our technician will explain the issue, recommended solution, and estimated charges before proceeding with repair work.",
        "Diagnostic or visit charges, if applicable, will be communicated clearly before service begins.",
      ],
    },
    {
      id: "replacement-parts",
      title: "6. Replacement Parts",
      paragraphs: [
        "If spare parts such as capacitors, compressors, PCB boards, motors, or refrigerant components are required, they are billed separately based on the part type, brand compatibility, and current market rates.",
        "We aim to use genuine or high-quality compatible parts. Part costs and applicable warranties will be explained before installation.",
      ],
    },
    {
      id: "customer-responsibilities",
      title: "7. Customer Responsibilities",
      paragraphs: [
        "You agree to provide accurate booking information, safe access to the AC unit, a stable power supply where required, and a suitable workspace for our technician.",
        "You are responsible for securing valuables and ensuring pets or obstacles do not interfere with service work.",
      ],
    },
    {
      id: "cancellation-policy",
      title: "8. Cancellation Policy",
      paragraphs: [
        "You may cancel or reschedule a booking through your customer dashboard or by contacting us by phone or WhatsApp, subject to our Refund & Cancellation Policy.",
        "Repeated no-shows, false bookings, or misuse of the platform may result in account restrictions.",
      ],
    },
    {
      id: "company-rights",
      title: "9. Company Rights",
      paragraphs: [
        "Arti Air Con reserves the right to accept or decline bookings, reassign technicians, modify service slots, and update pricing, service areas, or platform features at any time.",
        "We may suspend or terminate access to the website, customer account, or admin dashboard in cases of fraud, abuse, harassment of staff, or violation of these terms.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "10. Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by law, Arti Air Con shall not be liable for indirect, incidental, or consequential damages arising from website downtime, booking delays, third-party service failures, or issues outside our reasonable control.",
        "Our liability for any service-related claim is limited to the amount paid for the specific service giving rise to the claim, except where applicable law requires otherwise.",
      ],
    },
    {
      id: "intellectual-property",
      title: "11. Intellectual Property",
      paragraphs: [
        "All website content, branding, logos, text, layout, and software associated with Arti Air Con are owned by or licensed to us and may not be copied, reproduced, or reused without written permission.",
      ],
    },
    {
      id: "website-usage",
      title: "12. Website Usage",
      paragraphs: [
        "You may use our website and booking platform for lawful personal or business purposes related to requesting AC services.",
        "You must not attempt to interfere with site security, scrape protected data, reverse engineer platform features, or access admin areas without authorization.",
      ],
    },
    {
      id: "prohibited-activities",
      title: "13. Prohibited Activities",
      paragraphs: ["You must not:"],
      list: [
        "Create fake bookings or impersonate another person",
        "Submit false addresses, phone numbers, or payment-related information",
        "Harass technicians, support staff, or other users",
        "Upload malicious files or attempt unauthorized access to accounts",
        "Use the platform for unlawful, fraudulent, or abusive purposes",
      ],
    },
    {
      id: "termination",
      title: "14. Termination",
      paragraphs: [
        "We may suspend or terminate your account or booking access if you violate these terms or misuse the platform. You may stop using our services at any time.",
        "Sections relating to liability, intellectual property, and dispute resolution will survive termination where applicable.",
      ],
    },
    {
      id: "changes-to-terms",
      title: "15. Changes to Terms",
      paragraphs: [
        "We may update these Terms of Use from time to time. The updated version will be posted on this page with a revised date. Continued use of the platform after changes are published constitutes acceptance of the updated terms.",
      ],
    },
    {
      id: "contact-information",
      title: "16. Contact Information",
      paragraphs: [
        "For questions about these Terms of Use, contact Arti Air Con:",
        "Phone: +91 9264173334",
        "WhatsApp: +91 8271876176",
        "Email: info@artiair.com",
        "Address: Aaya nagar, sunday-market road, H block, phase-6, Bandh road-Market, Delhi",
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalPageContent = {
  title: "Privacy Policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "This Privacy Policy explains how Arti Air Con collects, uses, stores, and protects personal information when you use our AC service booking platform, customer login, notifications, and support channels.",
  sections: [
    {
      id: "collected-information",
      title: "1. Information We Collect",
      paragraphs: [
        "We collect information necessary to provide AC repair and service booking, manage your account, communicate with you, and improve our platform.",
      ],
    },
    {
      id: "phone-number",
      title: "2. Phone Number",
      paragraphs: [
        "Your mobile number is used for account login via OTP, booking confirmations, technician updates, support calls, and service-related SMS or WhatsApp messages.",
      ],
    },
    {
      id: "name",
      title: "3. Name",
      paragraphs: [
        "Your name helps us identify your booking, personalize communication, and maintain your service history in your customer dashboard.",
      ],
    },
    {
      id: "booking-details",
      title: "4. Booking Details",
      paragraphs: [
        "When you book a service, we collect details such as service type, AC brand and type, preferred date and time, service notes, booking status, and technician assignment information.",
      ],
    },
    {
      id: "address",
      title: "5. Address and Location Information",
      paragraphs: [
        "We collect your service address so our technician can visit the correct location. If Google Maps or location features are added in the future, location data will be used only to improve address accuracy and routing with your consent.",
      ],
    },
    {
      id: "usage-data",
      title: "6. Usage Data",
      paragraphs: [
        "We may collect technical information such as browser type, device information, pages visited, and interaction events to maintain platform security, troubleshoot issues, and improve user experience.",
      ],
    },
    {
      id: "cookies",
      title: "7. Cookies",
      paragraphs: [
        "We use cookies and similar technologies for authentication, session management, and preferences. Please see our Cookie Policy for more details.",
      ],
    },
    {
      id: "notification-tokens",
      title: "8. Notification Tokens",
      paragraphs: [
        "If you enable push notifications, we store Firebase Cloud Messaging (FCM) device tokens to send booking updates, status changes, and service alerts to your browser or device.",
        "You can disable notifications at any time through your browser or device settings.",
      ],
    },
    {
      id: "authentication",
      title: "9. Authentication Data",
      paragraphs: [
        "When you log in, we use secure session cookies to keep you signed in to your customer account or admin dashboard. Password and OTP data are handled using industry-standard security practices.",
      ],
    },
    {
      id: "how-data-is-stored",
      title: "10. How Data Is Stored",
      paragraphs: [
        "Your account, booking, and notification data are stored in secure databases and application systems used to operate the Arti Air Con platform.",
        "We retain information only for as long as needed to provide services, comply with legal obligations, resolve disputes, and maintain booking history.",
      ],
    },
    {
      id: "how-data-is-protected",
      title: "11. How Data Is Protected",
      paragraphs: [
        "We use access controls, encrypted connections (HTTPS), secure authentication, rate limiting, and administrative safeguards to protect personal information.",
        "Only authorized staff and systems required to deliver services may access customer data.",
      ],
    },
    {
      id: "third-party-services",
      title: "12. Third-Party Services",
      paragraphs: ["We may use trusted third-party providers to operate our platform, including:"],
      list: [
        "Firebase – push notifications and messaging infrastructure",
        "Google Maps – location and address services if added later",
        "Analytics providers – future website usage analytics, if enabled",
        "Hosting and infrastructure providers – secure application delivery",
      ],
    },
    {
      id: "customer-rights",
      title: "13. Your Rights",
      paragraphs: [
        "You may request access to, correction of, or deletion of your personal information, subject to legal and operational requirements.",
        "To exercise your rights, contact us using the details below. We may need to verify your identity before processing a request.",
      ],
    },
    {
      id: "contact",
      title: "14. Contact Us",
      paragraphs: [
        "For privacy-related questions, contact:",
        "Email: info@artiair.com",
        "Phone: +91 9264173334",
        "Address: Aaya nagar, sunday-market road, H block, phase-6, Bandh road-Market, Delhi",
      ],
    },
  ],
};

export const COOKIE_POLICY: LegalPageContent = {
  title: "Cookie Policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "This Cookie Policy explains how Arti Air Con uses cookies and similar technologies on our AC service booking website and customer portal.",
  sections: [
    {
      id: "what-are-cookies",
      title: "1. What Are Cookies?",
      paragraphs: [
        "Cookies are small text files stored on your device when you visit a website. They help websites remember your session, preferences, and certain activity so the site works properly.",
      ],
    },
    {
      id: "authentication-cookies",
      title: "2. Authentication Cookies",
      paragraphs: [
        "We use secure session cookies to keep you logged in to your customer account or admin dashboard after you authenticate with OTP or admin credentials.",
        "These cookies are essential for account security and expire after your session ends or based on configured session timeout settings.",
      ],
    },
    {
      id: "session-cookies",
      title: "3. Session Cookies",
      paragraphs: [
        "Session cookies support core website functions such as maintaining login state, protecting routes, and ensuring booking actions are linked to the correct user.",
      ],
    },
    {
      id: "preference-cookies",
      title: "4. Preference Cookies",
      paragraphs: [
        "Preference cookies may store choices such as language selection or interface settings so your experience remains consistent during future visits.",
      ],
    },
    {
      id: "analytics-cookies",
      title: "5. Analytics Cookies",
      paragraphs: [
        "We may use analytics cookies in the future to understand how visitors use our website, which pages are most helpful, and how we can improve booking flows.",
        "If analytics tools are enabled, we will update this policy and, where required, request consent before non-essential tracking begins.",
      ],
    },
    {
      id: "managing-cookies",
      title: "6. Managing Cookies",
      paragraphs: [
        "You can control or delete cookies through your browser settings. Please note that disabling essential cookies may prevent login, booking, and dashboard features from working correctly.",
      ],
    },
    {
      id: "contact",
      title: "7. Contact",
      paragraphs: [
        "Questions about this Cookie Policy can be sent to info@artiair.com or +91 9264173334.",
      ],
    },
  ],
};

export const DISCLAIMER: LegalPageContent = {
  title: "Disclaimer",
  lastUpdated: LAST_UPDATED,
  intro:
    "The information on the Arti Air Con website and booking platform is provided for general service information and online booking purposes.",
  sections: [
    {
      id: "service-availability",
      title: "1. Service Availability",
      paragraphs: [
        "While we work to provide timely AC repair and maintenance services, availability depends on technician schedules, location, weather, traffic, and demand.",
        "Same-day or emergency service requests are handled on a best-effort basis and may not always be available in every area.",
      ],
    },
    {
      id: "pricing-may-vary",
      title: "2. Pricing May Vary",
      paragraphs: [
        "All prices, offers, and starting rates shown on the website are subject to change without notice.",
        "Promotional pricing, AMC plans, and service packages may have specific terms and geographic limitations.",
      ],
    },
    {
      id: "repair-cost-inspection",
      title: "3. Repair Cost Depends on Inspection",
      paragraphs: [
        "AC repair costs cannot always be determined before a technician inspects the unit on site.",
        "Final charges depend on the fault diagnosis, labor required, accessibility of the unit, and whether additional testing is needed.",
      ],
    },
    {
      id: "replacement-parts",
      title: "4. Replacement Parts Cost Extra",
      paragraphs: [
        "Spare parts such as compressors, PCB boards, capacitors, fan motors, refrigerant, and mounting accessories are not included in basic service rates unless explicitly stated.",
        "Customers will receive part and labor details before approval of non-standard repair work.",
      ],
    },
    {
      id: "emergency-limitations",
      title: "5. Emergency Service Limitations",
      paragraphs: [
        "Emergency support is subject to staff availability, safety conditions, and the nature of the reported issue.",
        "Complex repairs, major part replacements, or situations requiring specialized equipment may require a follow-up visit even during urgent requests.",
      ],
    },
    {
      id: "no-warranty-on-content",
      title: "6. Website Information",
      paragraphs: [
        "We make reasonable efforts to keep website content accurate, but we do not guarantee that all descriptions, pricing examples, or service timelines are complete or error-free at all times.",
      ],
    },
    {
      id: "contact",
      title: "7. Contact",
      paragraphs: [
        "For service clarification, contact Arti Air Con at +91 9264173334 or info@artiair.com.",
      ],
    },
  ],
};

export const REFUND_POLICY: LegalPageContent = {
  title: "Refund & Cancellation Policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "This policy explains how booking cancellations and refunds are handled on the Arti Air Con service booking platform.",
  sections: [
    {
      id: "booking-cancellation",
      title: "1. Booking Cancellation",
      paragraphs: [
        "You may cancel a scheduled service booking before the technician is dispatched or before service work begins, subject to the conditions below.",
        "Cancellation requests can be made from your customer dashboard or by contacting our support team by phone or WhatsApp.",
      ],
    },
    {
      id: "customer-cancellation",
      title: "2. Customer Cancellation",
      paragraphs: [
        "If you cancel well in advance of the scheduled visit, no service charge generally applies.",
        "Late cancellations, repeated rescheduling, or cancellation after technician dispatch may incur a visit or cancellation fee if applicable labor or travel has already been allocated.",
      ],
    },
    {
      id: "admin-cancellation",
      title: "3. Admin Cancellation",
      paragraphs: [
        "Arti Air Con or its admin team may cancel or reschedule a booking due to technician unavailability, incomplete address details, unsafe site conditions, weather disruptions, or operational reasons.",
        "If we cancel your booking, we will notify you by phone, SMS, WhatsApp, or in-app notification and help you choose a new time slot where possible.",
      ],
    },
    {
      id: "refund-situations",
      title: "4. Refund Situations",
      paragraphs: [
        "Refunds, where applicable, are considered in cases such as duplicate booking charges, confirmed service not delivered due to company-side cancellation, or pre-paid amounts for services that could not be completed as agreed.",
        "Any refund decision depends on the specific booking circumstances and communication records.",
      ],
    },
    {
      id: "no-online-payment",
      title: "5. No Online Payment Currently",
      paragraphs: [
        "At present, Arti Air Con does not collect service payments directly through the website booking checkout.",
        "Most services are payable after completion by cash, UPI, or other methods agreed with the technician or support team, unless a separate payment arrangement is confirmed in writing.",
      ],
    },
    {
      id: "future-payment-policy",
      title: "6. Future Online Payment Policy",
      paragraphs: [
        "If online payment features are introduced in the future, this policy will be updated to explain payment authorization, failed transaction handling, refund timelines, and dispute procedures for digital payments.",
      ],
    },
    {
      id: "contact",
      title: "7. Contact for Cancellations",
      paragraphs: [
        "Phone: +91 9264173334",
        "WhatsApp: +91 8271876176",
        "Email: info@artiair.com",
      ],
    },
  ],
};

export const SHIPPING_POLICY: LegalPageContent = {
  title: "Shipping Policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "Arti Air Con provides on-site AC repair, maintenance, and installation services. We do not sell or ship physical products through this website.",
  sections: [
    {
      id: "no-physical-goods",
      title: "1. No Physical Goods Shipped",
      paragraphs: [
        "This booking platform is used to schedule AC services at your location. We do not operate an e-commerce store and do not ship AC units, spare parts, or merchandise to customers through standard courier or postal delivery from this website.",
      ],
    },
    {
      id: "on-site-service",
      title: "2. On-Site Service Delivery",
      paragraphs: [
        "Service is delivered in person when our technician visits your home, office, or commercial site at the scheduled appointment time.",
        "Any replacement parts required for repair are typically procured and installed during the service visit, subject to availability and customer approval.",
      ],
    },
    {
      id: "service-area",
      title: "3. Service Area",
      paragraphs: [
        "We currently serve customers in and around Delhi and Gurgaon based on operational coverage. Service availability outside our active service area may be limited or unavailable.",
      ],
    },
    {
      id: "future-changes",
      title: "4. Future Changes",
      paragraphs: [
        "If we later offer product sales, part shipments, or delivery-based services, this Shipping Policy will be updated with delivery timelines, shipping charges, tracking information, and return procedures.",
      ],
    },
    {
      id: "contact",
      title: "5. Contact",
      paragraphs: [
        "For service area or appointment questions, contact +91 9264173334 or info@artiair.com.",
      ],
    },
  ],
};
