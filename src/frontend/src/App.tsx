import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatToScript } from "@/lib/utils";
import {
  ChevronRight,
  Layers,
  Loader2,
  Pencil,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import ReelCanvas from "./components/ReelCanvas";
import { useGenerateScript } from "./hooks/useQueries";

const SAMPLE_LINES = [
  "Most Indians spend 90% before saving anything.",
  "Your salary disappears — EMIs, rent, groceries.",
  "The wealthy save first. Then spend what's left.",
  "Start a ₹500/month SIP today. Watch it grow.",
  "Small habits build massive wealth over time.",
  "Follow Money Intelligence India for more insights",
];

const STRUCTURE_LABELS = [
  { label: "Hook", color: "#FFD700" },
  { label: "Problem", color: "#F87171" },
  { label: "Insight", color: "#60A5FA" },
  { label: "Solution", color: "#34D399" },
  { label: "Closure", color: "#A78BFA" },
  { label: "CTA", color: "#FFD700" },
];

interface Reel {
  hook: string;
  problem: string;
  insight: string;
  solution: string;
  closure: string;
  cta: string;
}

interface TopicData {
  id: number;
  topic: string;
  reels: Reel[];
}

const TOPICS_DATA: TopicData[] = [
  {
    id: 1,
    topic: "EMI Trap",
    reels: [
      {
        hook: "EMI makes you feel rich…",
        problem: "But your bank balance says otherwise.",
        insight: "EMI is future income already spent.",
        solution: "Reduce EMIs before upgrading lifestyle.",
        closure: "EMI comfort = financial pressure.",
        cta: "Follow for real money truths.",
      },
      {
        hook: "EMI is not affordability…",
        problem: "It's delayed financial stress.",
        insight: "You're committing future salary blindly.",
        solution: "Buy only what you can afford upfront.",
        closure: "If EMI is needed… you can't afford it.",
        cta: "Follow for clarity.",
      },
    ],
  },
  {
    id: 2,
    topic: "Salary Disappears",
    reels: [
      {
        hook: "Salary comes… disappears in 10 days?",
        problem: "You don't know where it went.",
        insight: "You're not tracking money.",
        solution: "Track every rupee for 30 days.",
        closure: "Awareness changes everything.",
        cta: "Follow for control.",
      },
    ],
  },
  {
    id: 3,
    topic: "Emergency Fund",
    reels: [
      {
        hook: "One emergency can destroy you…",
        problem: "If you have zero backup.",
        insight: "Savings = survival.",
        solution: "Build 3–6 months expense fund.",
        closure: "No savings = high risk life.",
        cta: "Follow for security.",
      },
    ],
  },
  {
    id: 4,
    topic: "Credit Card Trap",
    reels: [
      {
        hook: "Swipe now… regret later.",
        problem: "Credit feels like free money.",
        insight: "Interest makes it expensive.",
        solution: "Always pay full bill.",
        closure: "Credit is a tool, not income.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 5,
    topic: "Needs vs Wants",
    reels: [
      {
        hook: "You don't need it…",
        problem: "You just want it.",
        insight: "Wants are endless.",
        solution: "Control impulse buying.",
        closure: "Needs build life, wants drain money.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 6,
    topic: "Lifestyle Inflation",
    reels: [
      {
        hook: "Income increased…",
        problem: "Expenses increased faster.",
        insight: "That's lifestyle inflation.",
        solution: "Keep expenses stable.",
        closure: "Grow wealth, not lifestyle.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 7,
    topic: "Tracking Money",
    reels: [
      {
        hook: "What gets tracked grows…",
        problem: "You track nothing.",
        insight: "That's why money disappears.",
        solution: "Track daily expenses.",
        closure: "Numbers don't lie.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 8,
    topic: "Debt Free Life",
    reels: [
      {
        hook: "Debt-free is real freedom…",
        problem: "Most people stay stuck.",
        insight: "Debt kills options.",
        solution: "Clear loans aggressively.",
        closure: "No debt = peace.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 9,
    topic: "Impulse Buying",
    reels: [
      {
        hook: "You didn't plan it…",
        problem: "But you still bought it.",
        insight: "That's impulse spending.",
        solution: "Wait 24 hours before buying.",
        closure: "Control emotion, save money.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 10,
    topic: "Financial Discipline",
    reels: [
      {
        hook: "Discipline beats income…",
        problem: "Most people ignore it.",
        insight: "Habits build wealth.",
        solution: "Stay consistent.",
        closure: "Discipline = freedom.",
        cta: "Follow.",
      },
    ],
  },
];

function reelToLines(reel: Reel): string[] {
  return [
    reel.hook,
    reel.problem,
    reel.insight,
    reel.solution,
    reel.closure,
    reel.cta,
  ];
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [scriptLines, setScriptLines] = useState<string[]>(SAMPLE_LINES);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [reelKey, setReelKey] = useState(0);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);

  const generateScript = useGenerateScript();

  // ──────────────────────────────────────────────────────────
  // Select topic — pick random reel
  // ──────────────────────────────────────────────────────────
  const handleSelectTopic = (topicData: TopicData) => {
    const randomIndex = Math.floor(Math.random() * topicData.reels.length);
    const reel = topicData.reels[randomIndex];
    const lines = reelToLines(reel);
    setSelectedTopicId(topicData.id);
    setScriptLines(lines);
    setScriptGenerated(true);
    setReelKey((k) => k + 1);
    setAutoPlay(true);
    toast.success(`"${topicData.topic}" reel ready!`);
  };

  // ──────────────────────────────────────────────────────────
  // Generate Script (AI) — uses topic input
  // ──────────────────────────────────────────────────────────
  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    try {
      const lines = await generateScript.mutateAsync(topic.trim());
      setScriptLines(lines);
      setScriptGenerated(true);
      setSelectedTopicId(null);
      setReelKey((k) => k + 1);
      setAutoPlay(true);
      toast.success("Script ready! Starting preview...");
    } catch {
      const fallback = [
        `Here's the truth about ${topic}.`,
        "Most people get this completely wrong.",
        `Understanding ${topic} can change your finances.`,
        "Take one small step today — start now.",
        "Knowledge is the best investment you'll make.",
        "Follow Money Intelligence India for more insights",
      ];
      setScriptLines(fallback);
      setScriptGenerated(true);
      setSelectedTopicId(null);
      setReelKey((k) => k + 1);
      setAutoPlay(true);
      toast.success("Script ready! Starting preview...");
    }
  };

  // ──────────────────────────────────────────────────────────
  // Use My Script — takes user input DIRECTLY, no AI
  // ──────────────────────────────────────────────────────────
  const handleUseMyScript = () => {
    if (!content.trim()) {
      toast.error("Enter your script first");
      return;
    }
    const lines = formatToScript(content.trim());
    setScriptLines(lines);
    setScriptGenerated(true);
    setSelectedTopicId(null);
    setReelKey((k) => k + 1);
    setAutoPlay(true);
    toast.success("Your script is ready! Starting preview...");
  };

  const handleEditLine = (i: number) => {
    setEditingIndex(i);
    setEditValue(scriptLines[i]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...scriptLines];
    updated[editingIndex] = editValue;
    setScriptLines(updated);
    setEditingIndex(null);
    setReelKey((k) => k + 1);
  };

  const isLoading = generateScript.isPending;

  return (
    <div className="min-h-screen" style={{ background: "#070A12" }}>
      <Toaster position="top-center" />

      {/* Gold Brand Bar */}
      <div
        className="w-full text-center py-2 text-xs font-bold tracking-widest"
        style={{
          background:
            "linear-gradient(90deg, #C9A227, #E1C15A, #FFD700, #E1C15A, #C9A227)",
          color: "#070A12",
        }}
      >
        ✦ MONEY INTELLIGENCE INDIA ✦
      </div>

      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 w-full px-3 py-2.5 flex items-center justify-between"
        style={{
          background: "rgba(7, 10, 18, 0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #222C3C",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#E1C15A" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#070A12" }} />
          </div>
          <span className="font-bold text-base tracking-tight gold-text">
            M.I. REEL MACHINE
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-primary/40 text-primary shrink-0"
        >
          9:16
        </Badge>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-3 py-4">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="rounded-2xl p-4 card-glow"
            style={{ background: "#121A24", border: "1px solid #222C3C" }}
          >
            <h2
              className="font-bold text-base mb-0.5"
              style={{ color: "#F2F4F8" }}
            >
              Create Your Reel
            </h2>
            <p className="text-xs mb-4" style={{ color: "#A6AFBF" }}>
              Pick a topic or paste your own script → Preview &amp; Download
            </p>

            <Tabs defaultValue="topics">
              <TabsList
                className="w-full mb-4 p-1"
                style={{ background: "#0B1220", border: "1px solid #222C3C" }}
                data-ocid="input.tab"
              >
                <TabsTrigger
                  value="topics"
                  className="flex-1 font-semibold text-sm data-[state=active]:text-primary-foreground"
                  data-ocid="input.topics.tab"
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Topics
                </TabsTrigger>
                <TabsTrigger
                  value="topic"
                  className="flex-1 font-semibold text-sm data-[state=active]:text-primary-foreground"
                  data-ocid="input.topic.tab"
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                  AI Script
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="flex-1 font-semibold text-sm"
                  data-ocid="input.content.tab"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  My Script
                </TabsTrigger>
              </TabsList>

              {/* ── Topics Tab ── */}
              <TabsContent value="topics" className="space-y-2">
                <p className="text-xs mb-3" style={{ color: "#A6AFBF" }}>
                  Select a topic — a reel script will be picked instantly.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS_DATA.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTopic(t)}
                      className="text-left px-3 py-3 rounded-xl transition-all text-sm font-medium min-h-[52px] flex items-center justify-between gap-2"
                      style={{
                        background:
                          selectedTopicId === t.id
                            ? "rgba(225,193,90,0.15)"
                            : "#0B1220",
                        border:
                          selectedTopicId === t.id
                            ? "1px solid #E1C15A88"
                            : "1px solid #222C3C",
                        color: selectedTopicId === t.id ? "#E1C15A" : "#F2F4F8",
                      }}
                    >
                      <span>{t.topic}</span>
                      {t.reels.length > 1 && (
                        <span
                          className="text-xs shrink-0 px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(225,193,90,0.12)",
                            color: "#E1C15A",
                            border: "1px solid #E1C15A33",
                          }}
                        >
                          {t.reels.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* ── Topic Tab (AI) ── */}
              <TabsContent value="topic" className="space-y-3">
                <Input
                  id="topic-input"
                  placeholder="e.g. Save 20% of your salary"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateScript()}
                  className="text-base h-12 py-3 px-4 text-foreground"
                  style={{
                    background: "#0B1220",
                    border: "1px solid #222C3C",
                    fontSize: "16px",
                  }}
                  data-ocid="topic.input"
                />
                {/* Quick chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Save 20% salary",
                    "EMI trap",
                    "Mutual funds SIP",
                    "Emergency fund",
                  ].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setTopic(s)}
                      className="flex items-center py-2 px-4 rounded-full transition-colors text-sm min-h-[44px]"
                      style={{
                        background:
                          topic === s ? "rgba(225,193,90,0.15)" : "#1A2535",
                        border:
                          topic === s
                            ? "1px solid #E1C15A88"
                            : "1px solid #2A3850",
                        color: topic === s ? "#E1C15A" : "#A6AFBF",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleGenerateScript}
                  disabled={isLoading || !topic.trim()}
                  className="w-full font-bold h-14 text-base mt-1"
                  style={{ background: "#E1C15A", color: "#070A12" }}
                  data-ocid="topic.submit_button"
                >
                  {generateScript.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Script
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* ── My Script Tab ── */}
              <TabsContent value="content" className="space-y-3">
                <p className="text-xs" style={{ color: "#A6AFBF" }}>
                  Paste your content below. It will be split into reel-ready
                  lines exactly as written — no AI changes.
                </p>
                <Textarea
                  id="content-textarea"
                  placeholder="Paste your script here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="resize-none text-foreground"
                  style={{
                    background: "#0B1220",
                    border: "1px solid #222C3C",
                    fontSize: "16px",
                  }}
                  data-ocid="content.textarea"
                />
                <Button
                  onClick={handleUseMyScript}
                  disabled={!content.trim()}
                  className="w-full font-bold h-14 text-base"
                  style={{ background: "#E1C15A", color: "#070A12" }}
                  data-ocid="content.submit_button"
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Use My Script → Preview
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Reel Preview */}
        <AnimatePresence>
          {scriptGenerated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div
                className="rounded-2xl p-4 card-glow"
                style={{ background: "#121A24", border: "1px solid #222C3C" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2
                      className="font-bold text-base"
                      style={{ color: "#F2F4F8" }}
                    >
                      Reel Preview
                    </h2>
                    <p className="text-xs" style={{ color: "#A6AFBF" }}>
                      9:16 vertical · 1080×1920 export
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs" style={{ color: "#A6AFBF" }}>
                      Live
                    </span>
                  </div>
                </div>
                <ReelCanvas
                  key={reelKey}
                  lines={scriptLines}
                  autoPlay={autoPlay}
                  onAutoPlayStarted={() => setAutoPlay(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Script Lines Editor */}
        <AnimatePresence mode="wait">
          {scriptLines.length > 0 && (
            <motion.div
              key={reelKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-2xl p-4 card-glow"
              style={{ background: "#121A24", border: "1px solid #222C3C" }}
              data-ocid="script.panel"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: "#F2F4F8" }}>
                  Script Lines
                  <span
                    className="ml-2 text-xs font-normal"
                    style={{ color: "#A6AFBF" }}
                  >
                    (tap to edit)
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setScriptLines(SAMPLE_LINES);
                    setSelectedTopicId(null);
                    setReelKey((k) => k + 1);
                  }}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "#A6AFBF" }}
                  data-ocid="script.secondary_button"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-2">
                {scriptLines.map((line, i) => {
                  const labelInfo = STRUCTURE_LABELS[i] || STRUCTURE_LABELS[5];
                  const isCTA = i === scriptLines.length - 1;

                  return (
                    <div
                      key={`${reelKey}-${line.slice(0, 20)}-${i}`}
                      className="flex gap-2 items-start"
                      data-ocid={`script.item.${i + 1}`}
                    >
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full mt-1 shrink-0"
                        style={{
                          background: `${labelInfo.color}22`,
                          color: labelInfo.color,
                          border: `1px solid ${labelInfo.color}44`,
                        }}
                      >
                        {labelInfo.label}
                      </span>

                      {editingIndex === i ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSaveEdit()
                            }
                            autoFocus
                            className="flex-1 text-sm"
                            style={{
                              background: "#0B1220",
                              border: "1px solid #E1C15A",
                              fontSize: "16px",
                            }}
                            data-ocid="script.input"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-10 w-10 p-0"
                            style={{ background: "#E1C15A", color: "#070A12" }}
                            data-ocid="script.save_button"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditLine(i)}
                          className="flex-1 text-left text-sm px-3 py-3 rounded-lg transition-colors hover:opacity-80 min-h-[52px] flex items-center"
                          style={{
                            background: isCTA
                              ? "rgba(225,193,90,0.1)"
                              : "#0B1220",
                            border: isCTA
                              ? "1px solid #E1C15A44"
                              : "1px solid #222C3C",
                            color: isCTA ? "#E1C15A" : "#F2F4F8",
                            fontWeight: isCTA ? 700 : 400,
                          }}
                          data-ocid={`script.edit_button.${i + 1}`}
                        >
                          {line}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="mt-10 pb-8 text-center px-4"
        style={{ borderTop: "1px solid #222C3C", paddingTop: "1.5rem" }}
      >
        <p className="text-xs" style={{ color: "#A6AFBF" }}>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            style={{ color: "#E1C15A" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
