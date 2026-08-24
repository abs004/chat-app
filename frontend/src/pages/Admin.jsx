import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { API_BASE_URL } from "../constants/config.js";
import { getToken } from "../utils/token.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Sidebar nav items ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l4-4 4 4 4-6 4 4" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
      </svg>
    ),
  },
  {
    id: "users",
    label: "Users",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ── Shared UI ─────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function LoadingCenter() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <Spinner />
      <p className="text-[#4B5563] text-sm">Loading…</p>
    </div>
  );
}

function ErrorCenter({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5 text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-red-400 text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] text-[#D1D5DB] rounded-xl text-sm hover:bg-white/[0.09] cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Overview tab ──────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    key: "totalUsers",
    label: "Total Users",
    color: "text-white",
    bg: "bg-white/[0.04]",
    iconColor: "text-[#6B7280]",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "activeChats",
    label: "Active Chats",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5",
    iconColor: "text-emerald-500/40",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    key: "totalReports",
    label: "Total Reports",
    color: "text-yellow-400",
    bg: "bg-yellow-500/5",
    iconColor: "text-yellow-500/40",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
      </svg>
    ),
  },
  {
    key: "pendingReports",
    label: "Pending Reports",
    color: "text-red-400",
    bg: "bg-red-500/5",
    iconColor: "text-red-500/40",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: "bannedUsers",
    label: "Banned Users",
    color: "text-red-400",
    bg: "bg-red-500/5",
    iconColor: "text-red-500/40",
    icon: (
      <svg fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
];

function StatCard({ card, value }) {
  return (
    <div className={`relative rounded-2xl border border-white/[0.07] p-6 flex flex-col gap-3 ${card.bg}`}>
      <div className={`absolute top-4 right-4 ${card.iconColor}`}>{card.icon}</div>
      <span className={`text-4xl font-bold tracking-tight ${card.color}`}>
        {value ?? "—"}
      </span>
      <span className="text-[#6B7280] text-sm font-medium">{card.label}</span>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 flex flex-col gap-3 animate-pulse">
      <div className="h-10 w-16 bg-white/[0.06] rounded-lg" />
      <div className="h-4 w-24 bg-white/[0.04] rounded" />
    </div>
  );
}

function OverviewTab({ authenticatedFetch }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/admin/stats`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load stats");
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (error) return <ErrorCenter message={error} onRetry={fetchStats} />;

  return (
    <div className="p-6 md:p-8">
      <p className="text-[#6B7280] text-sm mb-6">Platform statistics at a glance.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : STAT_CARDS.map((card) => (
              <StatCard key={card.key} card={card} value={stats?.[card.key]} />
            ))}
      </div>
    </div>
  );
}

// ── Reports tab ───────────────────────────────────────────────────────────────

const STATUS_FILTERS = ["all", "pending", "reviewed", "dismissed"];

const STATUS_BADGE = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  reviewed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  dismissed: "bg-white/[0.05] text-[#6B7280] border-white/[0.08]",
};

function ChatModal({ conversationId, onClose, authenticatedFetch }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await authenticatedFetch(
          `${API_BASE_URL}/admin/reports/${conversationId}/messages`,
          { headers: authHeaders() }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load messages");
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [conversationId, authenticatedFetch]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111418] border border-white/[0.08] rounded-2xl w-full max-w-lg mx-4 flex flex-col shadow-2xl max-h-[80vh]"
        style={{ fontFamily: "'Sora', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0">
          <div>
            <p className="text-white font-semibold text-sm">Reported Conversation</p>
            <p className="text-[#6B7280] text-xs mt-0.5">Messages from reported conversation</p>
          </div>
          <button onClick={onClose}
            className="text-[#6B7280] hover:text-white p-1.5 rounded-lg hover:bg-white/[0.05] border-none bg-transparent cursor-pointer">
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
          {loading && <LoadingCenter />}
          {error && <ErrorCenter message={error} />}
          {!loading && !error && messages.length === 0 && (
            <p className="text-center text-[#4B5563] text-sm py-8">No messages found.</p>
          )}
          {messages.map((msg) => (
            <div key={msg._id} className="flex flex-col gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <span className="text-[0.65rem] text-[#4B5563] font-mono">{msg.sender}</span>
              <p className="text-[#E5E7EB] text-sm leading-relaxed break-words">{msg.content}</p>
              <span className="text-[0.6rem] text-[#374151] self-end">{formatDate(msg.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report, onRefresh, authenticatedFetch }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState("");
  const [confirmDismiss, setConfirmDismiss] = useState(false);

  const isPending = report.status === "pending";

  const patchReport = async (status) => {
    setLoadingAction(status);
    try {
      const res = await authenticatedFetch(
        `${API_BASE_URL}/admin/reports/${report._id}`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update report");
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction("");
      setConfirmDismiss(false);
    }
  };

  const banUser = async (duration) => {
    setLoadingAction(`ban-${duration}`);
    try {
      const reportedId = report.reported?._id ?? report.reported;
      const res = await authenticatedFetch(
        `${API_BASE_URL}/admin/users/${reportedId}/ban`,
        {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ duration }),
        }
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to ban user");
      }
      // Auto-mark report as reviewed after banning
      await patchReport("reviewed");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <>
      <div className="bg-[#111418] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BADGE[report.status]}`}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
            <span className="text-white font-semibold text-sm capitalize">{report.reason}</span>
          </div>
          <span className="text-[#4B5563] text-xs shrink-0">{formatDate(report.createdAt)}</span>
        </div>

        {/* Description */}
        {report.description && (
          <p className="text-[#9CA3AF] text-sm leading-relaxed line-clamp-2">{report.description}</p>
        )}

        {/* Emails */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
            <p className="text-[#4B5563] text-[0.65rem] font-semibold uppercase tracking-wide mb-0.5">Reporter</p>
            <p className="text-[#D1D5DB] text-xs font-medium truncate">{report.reporter?.email ?? "—"}</p>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-3 py-2.5">
            <p className="text-[#4B5563] text-[0.65rem] font-semibold uppercase tracking-wide mb-0.5">Reported</p>
            <p className="text-[#D1D5DB] text-xs font-medium truncate">{report.reported?.email ?? "—"}</p>
          </div>
        </div>

        {/* Actions — only for pending */}
        {isPending && (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              {/* View Chat */}
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#D1D5DB] hover:bg-white/[0.08] cursor-pointer transition-all"
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                View Chat
              </button>

              {/* Mark Reviewed */}
              <button
                disabled={!!loadingAction}
                onClick={() => patchReport("reviewed")}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-all disabled:opacity-50"
              >
                {loadingAction === "reviewed" ? <Spinner /> : (
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Mark Reviewed
              </button>

              {/* Dismiss */}
              {confirmDismiss ? (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <span className="text-red-400 text-xs">Delete messages too?</span>
                  <button
                    disabled={!!loadingAction}
                    onClick={() => patchReport("dismissed")}
                    className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer bg-transparent border-none disabled:opacity-50"
                  >
                    {loadingAction === "dismissed" ? "…" : "Yes, dismiss"}
                  </button>
                  <button onClick={() => setConfirmDismiss(false)}
                    className="text-xs text-[#6B7280] hover:text-white cursor-pointer bg-transparent border-none">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  disabled={!!loadingAction}
                  onClick={() => setConfirmDismiss(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-all disabled:opacity-50"
                >
                  <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Dismiss
                </button>
              )}
            </div>

            {/* Ban section */}
            <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-white/[0.05]">
              <span className="text-[#6B7280] text-xs font-medium">Ban reported user:</span>
              {[
                { label: "1 Day", duration: "1d" },
                { label: "1 Week", duration: "7d" },
                { label: "Permanent", duration: "permanent" },
              ].map(({ label, duration }) => (
                <button
                  key={duration}
                  disabled={!!loadingAction}
                  onClick={() => banUser(duration)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all disabled:opacity-50 ${
                    duration === "permanent"
                      ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                      : "bg-white/[0.04] border-white/[0.08] text-[#D1D5DB] hover:bg-white/[0.08]"
                  }`}
                >
                  {loadingAction === `ban-${duration}` ? "…" : label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Chat modal */}
      {chatOpen && (
        <ChatModal
          conversationId={report.conversationId}
          onClose={() => setChatOpen(false)}
          authenticatedFetch={authenticatedFetch}
        />
      )}
    </>
  );
}

function ReportsTab({ authenticatedFetch }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authenticatedFetch(`${API_BASE_URL}/admin/reports`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load reports");
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div className="p-6 md:p-8 flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
              filter === f
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-white/[0.03] border-white/[0.07] text-[#6B7280] hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "all" && (
              <span className="ml-1.5 text-[0.6rem] opacity-70">
                {reports.filter((r) => r.status === f).length}
              </span>
            )}
          </button>
        ))}
        <button
          onClick={fetchReports}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-white border border-white/[0.07] hover:bg-white/[0.06] cursor-pointer transition-all bg-transparent"
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading && <LoadingCenter />}
      {error && <ErrorCenter message={error} onRetry={fetchReports} />}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-10 h-10 text-[#374151]">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
          </svg>
          <p className="text-[#4B5563] text-sm">No {filter === "all" ? "" : filter} reports found.</p>
        </div>
      )}
      {!loading && !error && filtered.map((report) => (
        <ReportCard
          key={report._id}
          report={report}
          onRefresh={fetchReports}
          authenticatedFetch={authenticatedFetch}
        />
      ))}
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────────────────────

function BanActions({ user, currentUserId, onAction, loadingId }) {
  const [open, setOpen] = useState(false);
  const isSelf = user._id === currentUserId;
  const isLoading = loadingId === user._id;

  // Never show actions for self or other admins
  if (isSelf || user.isAdmin) return <span className="text-[#374151] text-xs">—</span>;

  if (user.isBanned) {
    return (
      <button
        disabled={isLoading}
        onClick={() => onAction(user._id, "unban")}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-all disabled:opacity-50"
      >
        {isLoading ? "…" : "Unban"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#D1D5DB] hover:bg-white/[0.08] cursor-pointer transition-all"
      >
        {isLoading ? "…" : "Ban"}
        {!isLoading && (
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-[#1a1f26] border border-white/[0.10] rounded-xl shadow-2xl overflow-hidden min-w-[140px]">
          {[
            { label: "Ban 1 Day",    duration: "1d" },
            { label: "Ban 1 Week",   duration: "7d" },
            { label: "Ban Permanent", duration: "permanent" },
          ].map(({ label, duration }) => (
            <button
              key={duration}
              onClick={() => { setOpen(false); onAction(user._id, "ban", duration); }}
              className={`w-full text-left text-xs font-medium px-4 py-2.5 transition-colors cursor-pointer border-none bg-transparent ${
                duration === "permanent"
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-[#D1D5DB] hover:bg-white/[0.06]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-white/[0.05]">
      {["w-48", "w-24", "w-10", "w-20", "w-16"].map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className={`h-3.5 ${w} bg-white/[0.06] rounded`} />
        </td>
      ))}
    </tr>
  );
}

function UserStatusBadge({ user }) {
  if (!user.isBanned) {
    return <span className="text-emerald-400 text-xs font-medium">Active</span>;
  }
  if (!user.banExpiresAt) {
    return <span className="text-red-400 text-xs font-medium">Permanently banned</span>;
  }
  return (
    <span className="text-amber-400 text-xs font-medium">
      Banned until {new Date(user.banExpiresAt).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      })}
    </span>
  );
}

// Mobile card for a single user
function UserCard({ user, currentUserId, onAction, loadingId }) {
  return (
    <div className="bg-[#111418] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-white text-sm font-medium truncate">{user.email}</p>
          <p className="text-[#4B5563] text-xs">
            Joined {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {user.isVerified ? (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
              <svg fill="currentColor" viewBox="0 0 20 20" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          ) : (
            <span className="text-[#6B7280] text-xs">Unverified</span>
          )}
          {user.isAdmin && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Admin</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <UserStatusBadge user={user} />
        <BanActions user={user} currentUserId={currentUserId} onAction={onAction} loadingId={loadingId} />
      </div>
    </div>
  );
}

function UsersTab({ authenticatedFetch }) {
  const { userId: currentUserId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const fetchUsers = useCallback(async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const url = query
        ? `${API_BASE_URL}/admin/users?search=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/admin/users`;
      const res = await authenticatedFetch(url, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load users");
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial load
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { fetchUsers(search); }, 400);
    return () => clearTimeout(t);
  }, [search, fetchUsers]);

  const handleAction = async (userId, action, duration) => {
    setLoadingId(userId);
    try {
      const url = `${API_BASE_URL}/admin/users/${userId}/${action}`;
      const body = action === "ban" ? JSON.stringify({ duration }) : undefined;
      const res = await authenticatedFetch(url, {
        method: "PATCH",
        headers: authHeaders(),
        body,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || `Failed to ${action} user`);
      }
      // Update the row in-place without refetching
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...updated } : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B5563] pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#4B5563] outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>
        {!loading && !error && (
          <span className="text-[#6B7280] text-xs shrink-0">
            {users.length} {users.length === 1 ? "user" : "users"}
          </span>
        )}
        <button
          onClick={() => fetchUsers(search)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6B7280] hover:text-white border border-white/[0.07] hover:bg-white/[0.06] cursor-pointer transition-all bg-transparent"
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && <ErrorCenter message={error} onRetry={() => fetchUsers(search)} />}

      {/* Desktop table */}
      {!error && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-white/[0.07]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {["Email", "Joined", "Verified", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[0.65rem] font-semibold tracking-widest text-[#4B5563] uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 5 }).map((_, i) => <UserRowSkeleton key={i} />)}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[#4B5563] text-sm py-12">
                    {search ? `No users found matching "${search}"` : "No users found."}
                  </td>
                </tr>
              )}
              {!loading && users.map((user) => (
                <tr key={user._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate max-w-[220px]">{user.email}</span>
                      {user.isAdmin && (
                        <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#6B7280] text-xs whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5">
                    {user.isVerified ? (
                      <svg fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4 text-emerald-400">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4 text-red-400">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <UserStatusBadge user={user} />
                  </td>
                  <td className="px-4 py-3.5">
                    <BanActions user={user} currentUserId={currentUserId} onAction={handleAction} loadingId={loadingId} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!error && (
        <div className="flex md:hidden flex-col gap-3">
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111418] border border-white/[0.07] rounded-xl p-4 animate-pulse flex flex-col gap-3">
              <div className="h-4 w-48 bg-white/[0.06] rounded" />
              <div className="h-3 w-24 bg-white/[0.04] rounded" />
              <div className="h-3 w-20 bg-white/[0.04] rounded" />
            </div>
          ))}
          {!loading && users.length === 0 && (
            <p className="text-center text-[#4B5563] text-sm py-12">
              {search ? `No users found matching "${search}"` : "No users found."}
            </p>
          )}
          {!loading && users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              currentUserId={currentUserId}
              onAction={handleAction}
              loadingId={loadingId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function AdminSidebar({ activeTab, setActiveTab, onBackToApp }) {
  return (
    <aside
      className="hidden md:flex w-[220px] min-w-[220px] bg-[#111418] border-r border-white/[0.06] flex-col p-5 gap-4"
      style={{ fontFamily: "'Sora', sans-serif" }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-semibold text-sm tracking-tight">G-Chat</span>
          <span className="text-[#6B7280] text-[0.6rem] font-normal">Admin Panel</span>
        </div>
      </div>

      <p className="text-[0.6rem] font-semibold tracking-widest text-[#4B5563] pl-1 uppercase">Navigation</p>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium cursor-pointer text-left w-full border-none transition-all duration-200 ${
                active ? "bg-emerald-500/10 text-emerald-400 font-semibold" : "bg-transparent text-[#6B7280] hover:bg-white/[0.04] hover:text-white"
              }`}>
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <button onClick={onBackToApp}
        className="flex items-center gap-2 bg-transparent border-none text-[#6B7280] text-sm cursor-pointer px-3 py-2.5 rounded-xl hover:bg-white/[0.04] hover:text-white transition-all duration-200 text-left w-full">
        <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to app
      </button>
    </aside>
  );
}

// ── Mobile tab bar ────────────────────────────────────────────────────────────

function MobileTabBar({ activeTab, setActiveTab }) {
  return (
    <div className="flex md:hidden bg-[#111418] border-b border-white/[0.06]">
      {NAV_ITEMS.map((item) => {
        const active = activeTab === item.id;
        return (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[0.65rem] font-semibold border-none cursor-pointer transition-all duration-200 ${
              active ? "text-emerald-400 border-b-2 border-emerald-500 bg-emerald-500/5" : "text-[#6B7280] bg-transparent hover:text-white"
            }`}>
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { logout, authenticatedFetch } = useAuth();

  const handleBackToApp = () => navigate("/chat-landing");
  const handleLogout = () => { logout(); navigate("/login"); };

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab authenticatedFetch={authenticatedFetch} />;
      case "reports":  return <ReportsTab  authenticatedFetch={authenticatedFetch} />;
      case "users":    return <UsersTab authenticatedFetch={authenticatedFetch} />;
      default:         return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0F12] text-white overflow-hidden" style={{ fontFamily: "'Sora', sans-serif" }}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToApp={handleBackToApp} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.06] bg-[#0D0F12] shrink-0">
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-[#4B5563] text-xs mt-0.5">Admin Dashboard</p>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.05] border-none bg-transparent cursor-pointer">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {renderTab()}
        </main>
      </div>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
    </div>
  );
}
