import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    // Content-Security-Policy: Firebase FCM requires gstatic.com scripts and googleapis.com connections
    // Development mode requires 'unsafe-eval' and local WebSocket/HTTP connections for Turbopack/Fast Refresh
    const scriptSrc = ["'self'", "'unsafe-inline'", "https://www.gstatic.com"];
    if (isDev) {
      scriptSrc.push("'unsafe-eval'");
    }

    const connectSrc = [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "wss://*.firebaseio.com",
    ];
    if (isDev) {
      connectSrc.push("http:", "https:", "ws:", "wss:");
    }

    const cspDirectives = [
      "default-src 'self'",
      `script-src ${scriptSrc.join(" ")}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      `connect-src ${connectSrc.join(" ")}`,
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    if (!isDev) {
      cspDirectives.push("upgrade-insecure-requests");
    }

    const csp = cspDirectives.join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          // X-XSS-Protection intentionally removed — deprecated, no effect in modern browsers,
          // can introduce XSS vulnerabilities in IE. CSP header above provides real protection.
        ],
      },
    ];
  },
};

export default nextConfig;
