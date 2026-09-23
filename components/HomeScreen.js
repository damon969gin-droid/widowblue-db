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
            const active = network === key;
            return (
              <button
                key={key}
                onClick={() => setNetwork(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-mono transition-all duration-200 ${
                  active
                    ? "bg-neutral-100 text-black font-semibold shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Icon size={13} />
                {meta.label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] font-mono text-neutral-500 mt-2 px-1 leading-tight">
          {NET_META[network]?.detail}
        </p>
      </section>

      {/* 3. Card Gamification: Contapassi & Token WBLU */}
      <section className="mx-5 my-2 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
            <Flame size={14} className="text-amber-500" />
            <span>Passi Giornalieri</span>
          </div>
          <button
            onClick={() => setShowTokenInfo((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors"
          >
            Cos&apos;è WBLU? <Info size={11} />
          </button>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {steps.toLocaleString("it-IT")}
          </span>
          <span className="text-xs font-mono text-neutral-500">
            / {stepGoal.toLocaleString("it-IT")} target
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-neutral-900 overflow-hidden mb-2.5 border border-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <Award size={13} /> +{fmtEuro(earnedEuro)} WBLU
          </span>
          <span className="text-neutral-500">
            ≈ €{fmtEuro(earnedEuro)} · max €20/g
          </span>
        </div>

        {showTokenInfo && (
          <div className="mt-3 pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed font-sans">
            WBLU è il token di utilità dell&apos;ecosistema Widow Blue: si accumula raggiungendo 7.000 passi al giorno ed è spendibile in sconti, premi o convertibile in valuta fiat.
          </div>
        )}
      </section>

      {/* 4. Barra di Ricerca */}
      <div className="px-5 py-1.5">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus-within:border-neutral-600 transition-colors">
          <Search size={14} className="text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca contatto, nodo mesh o messaggio..."
            className="bg-transparent border-none outline-none text-xs text-white placeholder-neutral-600 w-full font-sans"
          />
        </div>
      </div>

      {/* 5. Lista Canali Chat & Nodi Mesh */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {contactsList.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-neutral-600">
            Nessun nodo o chat trovata
          </div>
        ) : (
          contactsList.map((c) => {
            const lastMsgs = messages?.[c.id] || [];
            const last = lastMsgs[lastMsgs.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => onOpenChat(c.id)}
                className="w-full flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-neutral-900 active:scale-[0.99] transition-all text-left"
              >
                <div className="relative shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: (c.color || "#3B82F6") + "20",
                      color: c.color || "#60A5FA",
                      border: `1px solid ${(c.color || "#3B82F6")}40`,
                    }}
                  >
                    {c.group ? <Users size={16} /> : c.initials}
                  </div>
                  {c.status === "mesh" && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-black border border-neutral-800 flex items-center justify-center"
                      title="Connesso via Bluetooth Mesh"
                    >
                      <Bluetooth size={9} className="text-blue-400" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-200 truncate">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0 ml-2">
                      {last?.time || ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-neutral-400 truncate">
                      {last?.text || "Inizia una nuova conversazione protetta"}
                    </span>
                    {c.unread > 0 && (
                      <span className="shrink-0 ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
