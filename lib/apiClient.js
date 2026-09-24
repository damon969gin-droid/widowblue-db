"use client";

/**
 * API Client per Widow Blue Backend
 * Base URL configurable via env var NEXT_PUBLIC_API_URL
 * Fallback a Cloudflare Workers URL
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://widowblue-db.damon969gin.workers.dev/api";

function getHeaders(token = null) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const options = {
      method,
      headers: getHeaders(token),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (response.status === 401) {
      return { ok: false, offline: false, error: "Unauthorized - token scaduto" };
    }

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        offline: false,
        error: json.detail || json.error || response.statusText,
        data: json,
      };
    }

    return { ok: true, data: json };
  } catch (e) {
    return { ok: false, offline: true, error: String(e) };
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (e) {
    return false;
  }
}

export async function loginOrRegister(email, password, phone) {
  const loginRes = await apiCall("POST", "/auth/login", { email, password });
  if (loginRes.ok) {
    return loginRes;
  }

  const registerRes = await apiCall("POST", "/auth/register", {
    email,
    password,
    phone,
  });

  return registerRes;
}

export async function apiGetMe(token) {
  return apiCall("GET", "/auth/me", null, token);
}

export async function apiSetup2FA(token) {
  return apiCall("POST", "/auth/2fa/setup", {}, token);
}

export async function apiVerify2FA(token, code) {
  return apiCall("POST", "/auth/2fa/verify", { code }, token);
}

export async function apiGetContacts(token) {
  return apiCall("GET", "/chat/contacts", null, token);
}

export async function apiAddContacts(token, contacts) {
  return apiCall("POST", "/chat/contacts/batch", { contacts }, token);
}

export async function apiCreateContact(token, contact) {
  return apiCall("POST", "/chat/contacts", contact, token);
}

export async function apiGetMessages(token, contactId) {
  return apiCall("GET", `/chat/messages/${contactId}`, null, token);
}

export async function apiSendMessage(token, contactId, text) {
  return apiCall("POST", `/chat/messages/${contactId}/send`, { text }, token);
}

export async function apiSubmitSteps(token, steps) {
  return apiCall("POST", "/rewards/submit-steps", { steps }, token);
}

export async function apiGetRewards(token) {
  return apiCall("GET", "/rewards/user-rewards", null, token);
}

export function openMessageStream(token, contactId, onMessage) {
  try {
    const eventSource = new EventSource(
      `${API_URL}/chat/messages/${contactId}/stream?token=${token}`
    );

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        onMessage(message);
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  } catch (e) {
    console.error("Error opening stream:", e);
    return () => {};
  }
}
