"use client";

import React, { useState } from "react";
import { COLORS } from "../lib/theme";
import { CONTACTS } from "../lib/mockData";
import { Logo } from "./Shared";
import {
  Shield,
  Search,
  Bluetooth,
  Users,
  Wifi,
  Signal,
  Info,
  Globe,
  Bot,
  Flame,
  Award,
} from "lucide-react";

const NET_META = {
  mesh: {
    icon: Bluetooth,
    label: "Mesh P2P",
    detail: "Nodo Bluetooth 5.3 · 4/5 nodi cluster attivi · Condivisione crittografata",
  },
  wifi: {
    icon: Wifi,
    label: "Wi-Fi Univoco",
    detail: "Subnet isolata 10.42.7.113 · IP protetto da firewall a cascata",
  },
  "5g": {
    icon: Signal,
    label: "Rete 5G",
    detail: "Connessione diretta cella operatore · E2EE attivo",
  },
};

export { NET_META };

export function HomeScreen({
  onOpenChat = () => {},
  onOpenVpn = () => {},
  onOpenProfile = () => {},
  onOpenBrowser = () => {},
  onOpenAi = () => {},
  steps = 5420,
  stepGoal = 7000,
  earnedEuro = 15.48,
  fmtEuro = (v) => Number(v || 0).toFixed(2),
  showTokenInfo = false,
  setShowTokenInfo = () => {},
  network = "mesh",
  setNetwork = () => {},
  messages = {},
  contactsOverride,
  connectionStatus = "online",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const rawContacts = contactsOverride || CONTACTS || [];

  const contactsList = rawContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pct = Math.min(100, Math.round((steps / stepGoal) * 100));

  const statusMeta = {
    checking: { label: "Sincronizzazione...", color: COLORS?.textMuted || "#737373" },
    online: { label: "Nodo Attivo", color: COLORS?.online || "#10B981" },
    demo: { label: "Test Mesh", color: "#F59E0B" },
  }[connectionStatus] || { label: "Nodo Attivo", color: "#10B981" };

  return (
    <div className="flex flex-col h-full bg-black text-neutral-100 select-none overflow-hidden font-sans">
      
      {/* 1. Header Superiore con Logo e Scorciatoie */}
      <header className="flex items-center justify-between px-5 pt-10 pb-3 border-b border-neutral-900">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-wider font-mono uppercase text-white">
              Widow Blue
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full w-fit mt-0.5"
              style={{
                color: statusMeta.color,
                backgroundColor: statusMeta.color + "18",
              }}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBrowser}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            title="Navigatore Web"
          >
            <Globe size={14} className="text-neutral-400" />
          </button>

          <button
            onClick={onOpenAi}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            title="Assistente AI"
          >
            <Bot size={14} className="text-blue-400" />
          </button>

          <button
            onClick={onOpenVpn}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:bg-neutral-800 transition-colors"
            title="VPN Sicura"
          >
            <Shield size={14} className="text-emerald-400" />
          </button>

          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono font-bold text-neutral-300 flex items-center justify-center hover:bg-neutral-800 transition-colors"
          >
            TU
          </button>
        </div>
      </header>

      {/* 2. Selettore Canale di Rete (Mesh, Wi-Fi, 5G) */}
      <section className="px-5 pt-3 pb-2">
        <div className="flex p-1 bg-neutral-950 border border-neutral-800 rounded-xl gap-1">
          {["mesh", "wifi", "5g"].map((key) => {
            const meta = NET_META[key];
            const Icon = meta.icon;
            const active = network ===
