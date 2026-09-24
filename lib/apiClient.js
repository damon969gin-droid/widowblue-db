"use client";

/**
 * API Client per Widow Blue Backend (FastAPI Python)
 * Base URL configurable via env var NEXT_PUBLIC_API_URL
 * Fallback a Cloudflare Workers URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://widowblue-db.damon969gin.workers.dev/api";

// Headers base per tutte le richieste
function getHeaders(token = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ... (resto del file rimane uguale)
