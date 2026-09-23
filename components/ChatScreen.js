"use client";

import React, { useEffect } from "react";
import { COLORS, BACKGROUNDS, CHAT_FONTS } from "../lib/theme";
import { WebMesh, MessageBubble } from "./Shared";
import {
  ArrowLeft,
  Users,
  Globe,
  Bot,
  Palette,
  Paperclip,
  Smile,
  Mic,
  Send,
  Lock,
} from "lucide-react";

export function ChatScreen({
  contact = {
    id: "0",
    name: "Nodo Sconosciuto",
    initials: "??",
    color: "#3B82F6",
    statusLabel: "Mesh Standby",
  },
  messages = [],
  draft = "",
  setDraft = () => {},
  onSend = () => {},
  onBack = () => {},
  onOpenModal = () => {},
  bgTheme = "mesh",
  onOpenBgPicker = () => {},
  scrollRef,
  chatFont = "default",
}) {
  // Risoluzione sicura dello sfondo e della famiglia di font
  const defaultBg = { id: "mesh", style: { backgroundColor: COLORS?.void || "#000000" } };
  const bg = (BACKGROUNDS || []).find((b) => b.id === bgTheme) || defaultBg;
  
  const defaultFont = { id: "default", family: "inherit" };
  const fontFamily = ((CHAT_FONTS || []).find((f) => f.id === chatFont) || defaultFont).family;

  // Auto-scroll automatico in basso all'arrivo di nuovi messaggi
  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollRef]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (draft.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white select-none overflow-hidden font-sans">
      
      {/* 1. Header Chat con Info Nodo & Scorciatoie */}
      <div
        className="flex items-center justify-between border-b"
        style={{
          gap: 8,
          padding: "38px 12px 10px",
          borderColor: COLORS?.border || "#262626",
          backgroundColor: COLORS?.panel || "#0d0d0d",
        }}
      >
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-neutral-800/80 active:opacity-60 transition-colors"
          style={{ border: "none", background: "none", cursor: "pointer" }}
          title="Torna alla Home"
        >
          <ArrowLeft size={18} color={COLORS?.textPrimary || "#ffffff"} />
        </button>

        {/* Avatar Contatto / Cluster */}
        <div
          className="flex items-center justify-center font-bold text-xs shrink-0 rounded-full"
          style={{
            width: 36,
            height: 36,
            backgroundColor: (contact.color || "#3B82F6") + "2a",
            color: contact.color || "#3B82F6",
            border: `1px solid ${(contact.color || "#3B82F6")}40`,
          }}
        >
          {contact.group ? <Users size={15} /> : contact.initials}
        </div>

        {/* Dettagli Nome e Crittografia */}
        <div className="flex-1 min-w-0 ml-1">
          <p className="text-sm font-semibold truncate text-neutral-100">{contact.name}</p>
          <p
            className="text-[10px] font-mono truncate flex items-center gap-1"
            style={{ color: COLORS?.textMuted || "#737373" }}
          >
            <Lock size={9} className="text-emerald-400" />
            {contact.statusLabel || "E2EE Connesso"}
          </p>
        </div>

        {/* Pulsanti Web, AI & Palette Sfondi */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onOpenModal("web")}
            className="p-2 rounded-full hover:bg-neutral-800/60 active:opacity-60 transition-colors"
            style={{ border: "none", background: "none", cursor: "pointer" }}
            title="Navigatore Web Sandbox"
          >
            <Globe size={16} color={COLORS?.textMuted || "#888888"} />
          </button>

          <button
            onClick={() => onOpenModal("ai")}
            className="p-2 rounded-full hover:bg-neutral-800/60 active:opacity-60 transition-colors"
            style={{ border: "none", background: "none", cursor: "pointer" }}
            title="AI Assistant Mesh"
          >
            <Bot size={16} color={COLORS?.blue || "#3B82F6"} />
          </button>

          <button
            onClick={onOpenBgPicker}
            className="p-2 rounded-full hover:bg-neutral-800/60 active:opacity-60 transition-colors"
            style={{ border: "none", background: "none", cursor: "pointer" }}
            title="Personalizza Sfondo & Font"
          >
            <Palette size={16} color={COLORS?.textMuted || "#888888"} />
          </button>
        </div>
      </div>

      {/* 2. Area Messaggi & Animazione Sfondo WebMesh */}
      <div
        ref={scrollRef}
        className="flex-1 relative overflow-y-auto"
        style={{
          ...(bg?.style || {}),
          padding: 16,
        }}
      >
        {bgTheme === "mesh" && (
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ zIndex: 0 }}
          >
            <WebMesh size={240} opacity={0.08} />
          </div>
        )}

        <div className="relative flex flex-col z-10" style={{ gap: 10 }}>
          {messages.length === 0 ? (
            <div className="text-center py-12 text-xs font-mono text-neutral-600">
              Canale crittografato aperto. Nessun log registrato sul server.
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id || Math.random().toString()}
                message={m}
                fontFamily={fontFamily}
              />
            ))
          )}
        </div>
      </div>

      {/* 3. Barra Input / Invio / Allegati / Vocali */}
      <div
        className="flex items-center border-t"
        style={{
          gap: 6,
          padding: "8px 10px 10px",
          borderColor: COLORS?.border || "#262626",
          backgroundColor: COLORS?.panel || "#0d0d0d",
        }}
      >
        <button
          onClick={() => onOpenModal("attach")}
          className="p-2 rounded-full hover:bg-neutral-800/60 active:opacity-60 transition-colors"
          style={{ border: "none", background: "none", cursor: "pointer" }}
          title="Allega File, Foto o Chiave"
        >
          <Paperclip size={18} color={COLORS?.textMuted || "#888888"} />
        </button>

        {/* Input Testo Messaggio */}
        <div
          className="flex-1 flex items-center"
          style={{
            gap: 6,
            padding: "8px 12px",
            borderRadius: 999,
            backgroundColor: COLORS?.panel2 || "#171717",
            border: `1px solid ${COLORS?.border || "#262626"}`,
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrivi un messaggio crittografato..."
            className="flex-1 text-xs sm:text-sm font-sans"
            style={{
              background: "transparent",
              outline: "none",
              border: "none",
              color: COLORS?.textPrimary || "#ffffff",
              fontFamily: fontFamily,
            }}
          />
          <button
            onClick={() => onOpenModal("emoji")}
            style={{ border: "none", background: "none", padding: 0, display: "flex", cursor: "pointer" }}
            title="Emoji & Stickers"
          >
            <Smile size={17} color={COLORS?.textMuted || "#888888"} />
          </button>
        </div>

        {/* Tasto Dinamico: Invio o Microfono */}
        {draft.trim() ? (
          <button
            onClick={onSend}
            className="flex items-center justify-center p-2.5 rounded-full active:opacity-70 transition-transform active:scale-95"
            style={{
              backgroundColor: COLORS?.blue || "#3B82F6",
              border: "none",
              cursor: "pointer",
            }}
            title="Invia"
          >
            <Send size={15} color="#ffffff" />
          </button>
        ) : (
          <button
            onClick={() => onOpenModal("mic")}
            className="flex items-center justify-center p-2.5 rounded-full hover:bg-neutral-800/60 active:opacity-60 transition-colors"
            style={{ border: "none", background: "none", cursor: "pointer" }}
            title="Registra Vocale"
          >
            <Mic size={18} color={COLORS?.textMuted || "#888888"} />
          </button>
        )}
      </div>

    </div>
  );
}


