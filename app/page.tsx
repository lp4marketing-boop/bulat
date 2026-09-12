"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Users,
  Target,
  DollarSign,
  Rocket,
  LayoutDashboard,
  Building2,
  Activity,
  FileText,
  CheckCircle2,
  Clock,
  Brain,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  X,
  Sun,
  Moon,
  Loader2,
  Sparkles,
  TrendingUp,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { create } from "zustand";

// ─────────────────────────────────────────────
// Zustand Store
// ─────────────────────────────────────────────
type DepartmentStatus =
  | "idle"
  | "thinking"
  | "generating"
  | "approved"
  | "revision";

interface Department {
  id: string;
  name: string;
  icon: React.ElementType;
  status: DepartmentStatus;
  lastUpdate: string;
  artifact: string | null;
}

interface Brief {
  productName: string;
  description: string;
  audience: string[];
  budget: number;
  goal: string;
  customGoal: string;
}

interface AppState {
  theme: "dark" | "light";
  activeTab: "brief" | "executive" | "departments" | "metrics";
  brief: Brief;
  isLaunching: boolean;
  launchProgress: number;
  departments: Department[];
  logs: { id: string; time: string; message: string; type: "info" | "success" | "warning" }[];
  selectedDept: string | null;

  toggleTheme: () => void;
  setTab: (tab: AppState["activeTab"]) => void;
  updateBrief: (partial: Partial<Brief>) => void;
  addAudienceTag: (tag: string) => void;
  removeAudienceTag: (tag: string) => void;
  launchSimulation: () => void;
  setSelectedDept: (id: string | null) => void;
  addLog: (message: string, type?: "info" | "success" | "warning") => void;
}

const useStore = create<AppState>((set, get) => ({
  theme: "dark",
  activeTab: "brief",
  brief: {
    productName: "",
    description: "",
    audience: [],
    budget: 25000,
    goal: "user-acquisition",
    customGoal: "",
  },
  isLaunching: false,
  launchProgress: 0,
  departments: [
    { id: "strategy", name: "Strategy", icon: Target, status: "idle", lastUpdate: "—", artifact: null },
    { id: "marketing", name: "Marketing", icon: TrendingUp, status: "idle", lastUpdate: "—", artifact: null },
    { id: "sales", name: "Sales", icon: DollarSign, status: "idle", lastUpdate: "—", artifact: null },
    { id: "product", name: "Product", icon: Sparkles, status: "idle", lastUpdate: "—", artifact: null },
    { id: "operations", name: "Operations", icon: Building2, status: "idle", lastUpdate: "—", artifact: null },
    { id: "finance", name: "Finance", icon: BarChart3, status: "idle", lastUpdate: "—", artifact: null },
    { id: "hr", name: "HR", icon: Users, status: "idle", lastUpdate: "—", artifact: null },
  ],
  logs: [],
  selectedDept: null,

  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
  setTab: (tab) => set({ activeTab: tab }),
  updateBrief: (partial) => set((s) => ({ brief: { ...s.brief, ...partial } })),
  addAudienceTag: (tag) =>
    set((s) => {
      if (!tag.trim() || s.brief.audience.includes(tag.trim())) return s;
      return { brief: { ...s.brief, audience: [...s.brief.audience, tag.trim()] } };
    }),
  removeAudienceTag: (tag) =>
    set((s) => ({
      brief: { ...s.brief, audience: s.brief.audience.filter((t) => t !== tag) },
    })),
  setSelectedDept: (id) => set({ selectedDept: id }),
  addLog: (message, type = "info") =>
    set((s) => ({
      logs: [
        {
          id: crypto.randomUUID(),
          time: new Date().toLocaleTimeString(),
          message,
          type,
        },
        ...s.logs,
      ].slice(0, 50),
    })),

  launchSimulation: async () => {
    const { brief, addLog } = get();
    if (!brief.productName.trim()) {
      addLog("Product name is required to launch.", "warning");
      return;
    }

    set({ isLaunching: true, launchProgress: 0, activeTab: "executive" });
    addLog("Initializing AI Executive Board...", "info");

    // Simulate progressive launch
    for (let i = 0; i <= 100; i += 8) {
      await new Promise((r) => setTimeout(r, 120));
      set({ launchProgress: i });
    }

    // Kick off department simulations with staggered timing
    const depts = get().departments;
    const statuses: DepartmentStatus[] = ["thinking", "generating", "approved", "revision"];
    const artifacts: Record<string, string> = {
      strategy: `Strategic Pillars for ${brief.productName}\n\n1. Market Positioning: Own the "AI-first" narrative in ${brief.audience.join(", ") || "target segments"}.\n2. 90-day North Star: ${brief.goal === "custom" ? brief.customGoal : brief.goal.replace("-", " ")}.\n3. Competitive Moat: Proprietary data flywheel + rapid iteration loops.\n4. Resource Allocation: ${Math.round(brief.budget * 0.35).toLocaleString()} → Product, ${Math.round(brief.budget * 0.4).toLocaleString()} → Growth.`,
      marketing: `Growth Engine Blueprint\n\n• Primary Channel Mix: Content (40%) · Paid Social (30%) · Partnerships (20%) · Community (10%)\n• CAC Target: <$42 | LTV:CAC ≥ 3.5x\n• Flagship Campaign: "Build with ${brief.productName}" series\n• Budget: $${brief.budget.toLocaleString()}/mo allocated across experiments.`,
      sales: `Revenue Motion\n\n• ICP Definition refined for ${brief.audience[0] || "primary segment"}\n• Outbound sequences + product-led growth hybrid\n• Pipeline target: 4.2× quota coverage\n• Enablement: AI-generated battle cards & objection handling.`,
      product: `Product Roadmap Snapshot\n\nQ1 Focus: Core loop polish + onboarding conversion\nQ2: Collaboration features + API surface\nSuccess Metrics: Activation > 48%, Week-4 retention > 32%\nTech Debt Budget: 20% of sprint capacity.`,
      operations: `Operational Readiness\n\n• Support SLAs: <2h P1, <8h P2\n• Infrastructure: Auto-scaling + multi-region failover\n• Tooling stack: Linear · Notion · Intercom · Datadog\n• Capacity plan for 3× growth in 6 months.`,
      finance: `Financial Guardrails\n\n• Monthly burn aligned to $${brief.budget.toLocaleString()} marketing + fixed opex\n• Runway target: ≥18 months\n• Unit economics dashboard live\n• Scenario planning: Base / Upside / Downside models.`,
      hr: `Talent & Culture\n\n• Hiring priority: Full-stack AI engineers + Growth marketers\n• Remote-first with quarterly offsites\n• Performance system: Outcomes over output\n• DEI & psychological safety as non-negotiables.`,
    };

    for (let i = 0; i < depts.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
      const dept = depts[i];
      set((s) => ({
        departments: s.departments.map((d) =>
          d.id === dept.id
            ? { ...d, status: "thinking", lastUpdate: new Date().toLocaleTimeString() }
            : d
        ),
      }));
      addLog(`${dept.name} is analyzing the brief...`, "info");

      await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
      set((s) => ({
        departments: s.departments.map((d) =>
          d.id === dept.id
            ? { ...d, status: "generating", lastUpdate: new Date().toLocaleTimeString() }
            : d
        ),
      }));
      addLog(`${dept.name} is drafting strategic artifact...`, "info");

      await new Promise((r) => setTimeout(r, 1100 + Math.random() * 700));
      const finalStatus = Math.random() > 0.18 ? "approved" : "revision";
      set((s) => ({
        departments: s.departments.map((d) =>
          d.id === dept.id
            ? {
                ...d,
                status: finalStatus,
                lastUpdate: new Date().toLocaleTimeString(),
                artifact: artifacts[dept.id] || "Strategic output generated.",
              }
            : d
        ),
      }));
      addLog(
        `${dept.name} ${finalStatus === "approved" ? "approved" : "requested revision"} its report.`,
        finalStatus === "approved" ? "success" : "warning"
      );
    }

    set({ isLaunching: false, launchProgress: 100 });
    addLog("AI Executive Board is fully online.", "success");
    set({ activeTab: "departments" });
  },
}));

// ─────────────────────────────────────────────
// Shared UI Primitives
// ─────────────────────────────────────────────
const Badge = ({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "muted";
}) => {
  const styles = {
    default: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    muted: "bg-zinc-800/60 text-zinc-500 border-zinc-700/50",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

const GlassCard = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    onClick={onClick}
    className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl ${onClick ? "cursor-pointer hover:bg-white/10 transition-colors" : ""} ${className}`}
  >
    {children}
  </div>
);

const statusConfig: Record<
  DepartmentStatus,
  { label: string; variant: "default" | "success" | "warning" | "info" | "muted"; icon: React.ElementType }
> = {
  idle: { label: "Idle", variant: "muted", icon: Clock },
  thinking: { label: "Thinking", variant: "info", icon: Brain },
  generating: { label: "Generating Report", variant: "info", icon: Loader2 },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  revision: { label: "Revision Needed", variant: "warning", icon: AlertCircle },
};

// ─────────────────────────────────────────────
// Brief Input Tab
// ─────────────────────────────────────────────
function BriefInput() {
  const { brief, updateBrief, addAudienceTag, removeAudienceTag, launchSimulation, isLaunching } =
    useStore();
  const [tagInput, setTagInput] = useState("");
  const charLimit = 600;

  const handleAddTag = () => {
    if (tagInput.trim()) {
      addAudienceTag(tagInput);
      setTagInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold tracking-tight">Define Your Brief</h2>
        <p className="text-zinc-400 text-sm">
          Feed the AI Executive Board the essentials. They will generate cross-functional strategy in real time.
        </p>
      </div>

      <GlassCard className="p-6 md:p-8 space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Product / Service Name
          </label>
          <input
            type="text"
            value={brief.productName}
            onChange={(e) => updateBrief({ productName: e.target.value })}
            placeholder="e.g. NovaOps — AI Operations Platform"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-zinc-600"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Description
            </label>
            <span className={`text-xs ${brief.description.length > charLimit ? "text-red-400" : "text-zinc-500"}`}>
              {brief.description.length}/{charLimit}
            </span>
          </div>
          <textarea
            value={brief.description}
            onChange={(e) => updateBrief({ description: e.target.value.slice(0, charLimit) })}
            rows={4}
            placeholder="What does it do? What problem does it solve? Unique angle?"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-zinc-600 resize-none"
          />
        </div>

        {/* Target Audience */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4" /> Target Audience
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {brief.audience.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs border border-violet-500/30"
              >
                {tag}
                <button onClick={() => removeAudienceTag(tag)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              placeholder="Add segment (e.g. Series A founders)"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-zinc-600"
            />
            <button
              onClick={handleAddTag}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Monthly Marketing Budget
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
            <input
              type="number"
              value={brief.budget}
              onChange={(e) => updateBrief({ budget: Number(e.target.value) || 0 })}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>

        {/* Core Goal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
            <Target className="w-4 h-4" /> Core Business Goal
          </label>
          <select
            value={brief.goal}
            onChange={(e) => updateBrief({ goal: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none"
          >
            <option value="user-acquisition">User Acquisition</option>
            <option value="revenue-growth">Revenue Growth</option>
            <option value="market-share">Market Share</option>
            <option value="product-market-fit">Product-Market Fit</option>
            <option value="brand-awareness">Brand Awareness</option>
            <option value="custom">Custom Goal</option>
          </select>
          {brief.goal === "custom" && (
            <input
              type="text"
              value={brief.customGoal}
              onChange={(e) => updateBrief({ customGoal: e.target.value })}
              placeholder="Describe your custom goal..."
              className="w-full mt-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-zinc-600"
            />
          )}
        </div>

        {/* Launch Button */}
        <button
          onClick={launchSimulation}
          disabled={isLaunching || !brief.productName.trim()}
          className="w-full relative overflow-hidden group rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 font-semibold text-white transition-all shadow-lg shadow-violet-500/25"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLaunching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Launching Board...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Launch AI Executive Board
              </>
            )}
          </span>
        </button>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// CEO Executive Room
// ─────────────────────────────────────────────
function ExecutiveRoom() {
  const { isLaunching, launchProgress, departments, logs, brief } = useStore();
  const activeCount = departments.filter((d) => d.status !== "idle").length;
  const approvedCount = departments.filter((d) => d.status === "approved").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">CEO Executive Room</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time oversight of the AI leadership team working on{" "}
            <span className="text-violet-300 font-medium">{brief.productName || "your product"}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <GlassCard className="px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="text-sm">{activeCount}/7 Active</span>
          </GlassCard>
          <GlassCard className="px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">{approvedCount} Approved</span>
          </GlassCard>
        </div>
      </div>

      {isLaunching && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Board Initialization</span>
            <span className="text-sm text-violet-300">{launchProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: `${launchProgress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
        </GlassCard>
      )}

      {/* Live Activity Feed */}
      <GlassCard className="p-5">
        <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> Live Activity
        </h3>
        <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500 py-8 text-center">No activity yet. Launch the board to begin.</p>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 text-sm"
              >
                <span className="text-zinc-600 shrink-0 tabular-nums">{log.time}</span>
                <span
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "warning"
                      ? "text-amber-400"
                      : "text-zinc-300"
                  }
                >
                  {log.message}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// Department Board
// ─────────────────────────────────────────────
function DepartmentBoard() {
  const { departments, selectedDept, setSelectedDept } = useStore();
  const selected = departments.find((d) => d.id === selectedDept);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Department Board</h2>
        <p className="text-zinc-400 text-sm mt-1">Seven virtual departments executing in parallel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {departments.map((dept) => {
          const conf = statusConfig[dept.status];
          const Icon = dept.icon;
          const StatusIcon = conf.icon;
          return (
            <motion.div
              key={dept.id}
              layout
              whileHover={{ y: -2 }}
              onClick={() => setSelectedDept(dept.id)}
            >
              <GlassCard className="p-5 h-full flex flex-col gap-4 hover:border-violet-500/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-violet-300" />
                  </div>
                  <Badge variant={conf.variant}>
                    <StatusIcon
                      className={`w-3 h-3 ${dept.status === "generating" || dept.status === "thinking" ? "animate-spin" : ""}`}
                    />
                    {conf.label}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium">{dept.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Updated {dept.lastUpdate}</p>
                </div>
                {dept.artifact && (
                  <div className="mt-auto pt-2 flex items-center text-xs text-violet-300 gap-1">
                    View artifact <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Artifact Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedDept(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <selected.icon className="w-5 h-5 text-violet-300" />
                  <h3 className="font-semibold">{selected.name} · Strategic Artifact</h3>
                </div>
                <button
                  onClick={() => setSelectedDept(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selected.artifact ? (
                  <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans leading-relaxed">
                    {selected.artifact}
                  </pre>
                ) : (
                  <p className="text-zinc-500 text-sm">No artifact generated yet.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Live Metrics & Logs
// ─────────────────────────────────────────────
function MetricsLogs() {
  const { departments, logs, brief } = useStore();

  const stats = useMemo(() => {
    const approved = departments.filter((d) => d.status === "approved").length;
    const revision = departments.filter((d) => d.status === "revision").length;
    const active = departments.filter((d) => ["thinking", "generating"].includes(d.status)).length;
    return { approved, revision, active, total: departments.length };
  }, [departments]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Live Metrics & Logs</h2>
        <p className="text-zinc-400 text-sm mt-1">System health and decision trail</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Approved", value: stats.approved, color: "text-emerald-400" },
          { label: "In Progress", value: stats.active, color: "text-sky-400" },
          { label: "Needs Revision", value: stats.revision, color: "text-amber-400" },
          { label: "Budget", value: `$${brief.budget.toLocaleString()}`, color: "text-violet-300" },
        ].map((s) => (
          <GlassCard key={s.label} className="p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-medium mb-4">Decision Log</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-12">Waiting for simulation start…</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex gap-4 py-2 border-b border-white/5 last:border-0 text-sm"
              >
                <span className="text-zinc-600 w-20 shrink-0 tabular-nums">{log.time}</span>
                <span
                  className={
                    log.type === "success"
                      ? "text-emerald-400"
                      : log.type === "warning"
                      ? "text-amber-400"
                      : "text-zinc-300"
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Shell
// ─────────────────────────────────────────────
const tabs = [
  { id: "brief" as const, label: "Brief Input", icon: FileText },
  { id: "executive" as const, label: "CEO Executive Room", icon: LayoutDashboard },
  { id: "departments" as const, label: "Department Board", icon: Building2 },
  { id: "metrics" as const, label: "Live Metrics & Logs", icon: Activity },
];

export default function AICeoSimulator() {
  const { theme, toggleTheme, activeTab, setTab } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-zinc-100 text-zinc-900"}`}>
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-fuchsia-600/15 blur-3xl" />
      </div>

      {/* Top Nav */}
      <header className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">AI CEO Simulator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto pb-px -mb-px scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? "text-violet-300" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "brief" && <BriefInput />}
            {activeTab === "executive" && <ExecutiveRoom />}
            {activeTab === "departments" && <DepartmentBoard />}
            {activeTab === "metrics" && <MetricsLogs />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
