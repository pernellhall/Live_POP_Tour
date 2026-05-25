import React, { useState } from "react";
import { DemoState } from "./types";

import { VoiceAgent } from "./components/VoiceAgent";
import { Loader2, ArrowRight, Check, Sparkles, X } from "lucide-react";
import axios from "axios";

export default function App() {
  const [state, setState] = useState<DemoState>({
    step: "capture",
    lead: null,
    scrapedKnowledge: "",
    iframeBlocked: false,
  });

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", url: "" });
  const [showStripeModal, setShowStripeModal] = useState(false);

  const handleStartDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Synchronously create/resume the AudioContext exactly on user click (avoids autoplay restrictions)
    const win = window as any;
    if (!win.__AUDIO_CONTEXT || win.__AUDIO_CONTEXT.state === "closed") {
      win.__AUDIO_CONTEXT = new (window.AudioContext || win.webkitAudioContext)(
        { sampleRate: 16000 },
      );
    }
    if (win.__AUDIO_CONTEXT.state === "suspended") {
      win.__AUDIO_CONTEXT.resume();
    }

    try {
      console.log("--- NEW LEAD CAPTURED ---", formData);

      const response = await axios.post("/api/scrape", { url: formData.url });
      const { scrapedKnowledge, iframeBlocked } = response.data;

      setState({
        step: "demo",
        lead: formData,
        scrapedKnowledge,
        iframeBlocked,
      });
    } catch (err) {
      console.error("Failed to start demo", err);
      alert("Error generating the demo. Ensure the URL is valid.");
    } finally {
      setLoading(false);
    }
  };

  const endDemo = () => {
    setState({
      step: "capture",
      lead: null,
      scrapedKnowledge: "",
      iframeBlocked: false,
    });
    setFormData({ name: "", phone: "", url: "" });
  };

  const cleanLeadUrl = state.lead?.url
    ? state.lead.url.trim().replace(/^(https?:\/\/)+/i, "")
    : "";
  const rawUrl = cleanLeadUrl ? `https://${cleanLeadUrl}` : "";
  const iframeUrl = `/api/proxy?url=${encodeURIComponent(rawUrl)}`;
  const domainName =
    cleanLeadUrl.replace(/^www\./, "").split("/")[0] || "your company";
  return (
    <div className="w-full h-screen relative bg-zinc-950 font-sans overflow-hidden">
      {state.step === "capture" && (
        <div className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden pb-16 bg-zinc-950">
          {/* Main Site Background Image & Gradients */}
          <div className="fixed inset-0 pointer-events-none">
            <img
              src="https://picsum.photos/seed/agency/1920/1080?blur=4"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen grayscale"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-zinc-950/90 to-zinc-950"></div>
          </div>

          <div className="relative z-20 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col min-h-full justify-center">
            {/* Top Headline Section */}
            <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <h1 className="font-outfit text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 mb-6 tracking-tighter uppercase">
                24/7 Client Acquisition System
              </h1>
              <p className="text-lg md:text-2xl text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed tracking-wide">
                This is how your AI assistant should respond to your web viewer{" "}
                <span className="font-medium text-white italic">
                  instantly.
                </span>
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-20 w-full">
              {/* Left Column: Sales Copy */}
              <div className="flex-1 text-center lg:text-left flex flex-col items-center lg:items-start pt-6 w-full max-w-xl animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-semibold uppercase tracking-widest mb-8">
                  <Sparkles className="w-4 h-4 text-blue-400" /> Corporate grade
                  AI
                </div>

                <h2 className="font-outfit text-4xl md:text-5xl font-bold leading-[1.1] mb-6 tracking-tight text-white">
                  Capture 100%
                  <br />
                  of Inbound Calls.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                    Zero Lead Drift.
                  </span>
                </h2>

                <p className="text-lg text-zinc-400 mb-12 max-w-lg leading-relaxed font-light">
                  Your phone is currently a graveyard for decayed leads. Talk to
                  prospects at their absolute peak of interest without lifting a
                  finger.
                </p>

                <div className="w-full text-left">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-[0.2em] mb-6 pl-1">
                    WHY THIS CHANGES EVERYTHING
                  </h3>
                  <ul className="space-y-5 text-zinc-200">
                    {[
                      "100% Human-Like Qualification",
                      "Sub-30s Call Response Velocity",
                      "Autonomous Calendar Lock-in",
                    ].map((text) => (
                      <li key={text} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span className="font-medium tracking-wide text-lg">
                          {text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Form (The "Phone") */}
              <div className="flex-1 w-full max-w-sm flex flex-col items-center relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
                {/* Background glow behind phone */}
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>

                <div className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
                  <div className="w-full bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 pt-12 overflow-hidden relative">
                    {/* Phone notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-20 flex justify-center items-center">
                      <div className="w-12 h-1.5 bg-zinc-800 rounded-full"></div>
                    </div>

                    <div className="text-center mb-8">
                      <h3 className="font-outfit text-2xl text-white font-medium tracking-tight uppercase">
                        EXPERIENCE AI
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium mt-1">
                        Transform Your Business
                      </p>
                    </div>

                    <form
                      onSubmit={handleStartDemo}
                      className="flex flex-col gap-4 text-left relative z-10 w-full pointer-events-auto"
                    >
                      <div>
                        <label
                          htmlFor="form-name"
                          className="text-zinc-400 text-xs font-semibold ml-1 uppercase tracking-wider"
                        >
                          Name
                        </label>
                        <input
                          required
                          id="form-name"
                          name="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full mt-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium text-sm"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="form-phone"
                          className="text-zinc-400 text-xs font-semibold ml-1 uppercase tracking-wider"
                        >
                          Phone Number
                        </label>
                        <input
                          required
                          id="form-phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full mt-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium text-sm"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="form-url"
                          className="text-zinc-400 text-xs font-semibold ml-1 uppercase tracking-wider"
                        >
                          Website URL
                        </label>
                        <input
                          required
                          id="form-url"
                          name="url"
                          type="url"
                          value={formData.url}
                          onChange={(e) =>
                            setFormData({ ...formData, url: e.target.value })
                          }
                          className="w-full mt-1.5 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium text-sm"
                          placeholder="https://yourcompany.com"
                        />
                      </div>

                      <button
                        type="submit"
                        id="form-submit"
                        name="submit"
                        disabled={loading}
                        className="mt-6 bg-white hover:bg-zinc-200 text-black font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                      >
                        {loading ? (
                          <Loader2 className="animate-spin w-5 h-5 text-zinc-900" />
                        ) : (
                          "Launch Demo"
                        )}
                        {!loading && <ArrowRight className="w-5 h-5" />}
                      </button>
                    </form>
                  </div>
                </div>

                <p className="mt-8 text-zinc-500 text-sm font-light italic tracking-wide">
                  "Wait... is this already built for me?"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {state.step === "demo" && (
        <div className="absolute inset-0 z-10">
          {/* The Website Mirror */}
          <iframe
            src={iframeUrl}
            className="w-full h-full border-none"
            title="Prospect Website Mirror"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />

          {/* Exit Demo button overlay */}
          <div className="fixed top-4 right-4 z-[9999]">
            <button
              onClick={endDemo}
              className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800 transition-all text-xs uppercase tracking-widest font-mono pointer-events-auto shadow-lg cursor-pointer"
            >
              [ Exit Demo ]
            </button>
          </div>

          {/* FORCE TO FRONT: Adding a fixed container with max Z-Index */}
          <div className="fixed bottom-10 right-10 z-[9999] pointer-events-auto">
            <VoiceAgent
              scrapedData={state.scrapedKnowledge}
              userName={state.lead?.name || "Partner"}
              domainName={domainName}
              setShowStripeModal={setShowStripeModal}
            />
          </div>

          {/* Stripe Payment Modal */}
          {showStripeModal && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                onClick={() => setShowStripeModal(false)}
              />

              <div className="relative bg-white p-10 rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.3)] flex flex-col items-center gap-6 max-w-md w-full border border-zinc-200 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center mb-2">
                  {/* Dynamic Media Logo Graphic */}
                  <div className="flex gap-1.5 items-end justify-center h-12 mb-3">
                    <div className="w-3.5 h-6 bg-[#f05a28] rounded-sm"></div>
                    <div className="w-3.5 h-9 bg-[#fcee21] rounded-sm"></div>
                    <div className="w-3.5 h-8 bg-[#29afe3] rounded-sm"></div>
                    <div className="w-3.5 h-12 bg-[#8c2a9c] rounded-sm"></div>
                  </div>
                  <h1 className="text-[28px] font-black text-black tracking-tight leading-none mb-1">
                    Dynamic Media
                  </h1>
                  <p className="text-base font-medium text-black">
                    Fractional Ai Consultants
                  </p>
                </div>

                <div className="text-center w-full border-t border-gray-100 pt-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">
                    AI Voice Agent Project Initiation
                  </h2>
                  <p className="text-5xl font-extrabold text-blue-600 bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600 pb-1">
                    $2,500
                  </p>
                </div>

                {/* @ts-expect-error - Custom Stripe element */}
                <stripe-buy-button
                  buy-button-id="buy_btn_0TQcMASGSLpZdRqBbJPnUaYc"
                  publishable-key="pk_live_AyoNbnxb1C1Mr5p2abmyLoNA"
                />

                <button
                  onClick={() => setShowStripeModal(false)}
                  id="modal-close-btn"
                  name="close-modal"
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-950 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version Number overlay (visible across states, or you can place it just on capture) */}
      <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none z-30">
        <p className="text-white/40 text-xs font-mono font-medium tracking-widest">
          v1.0.0
        </p>
      </div>
    </div>
  );
}
