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

  // Filtro dinamico per contatti e chat
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
      <header className="flex items-center justify-between px-5 pt-10 pb-3 border-b
