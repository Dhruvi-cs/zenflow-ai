import { useState, useMemo } from "react";

// MOCK DATA - later replace with axios.get("/api/tickets")
const INITIAL_TICKETS = [
  {
    _id: "t1", customer: "Riya Sharma", subject: "Charged twice for my subscription",
    status: "open", sentiment: "angry", urgency: "high", category: "billing",
    summary: "Customer was billed twice this month and wants an immediate refund.",
    drafts: [
      "Hi Riya, I'm sorry about the double charge. I've flagged it for a refund, which should reach you in 3-5 business days.",
      "Hi Riya, could you share the last 4 digits of the card used? I'll trace both payments right away.",
    ],
    messages: [
      { from: "customer", text: "I was charged twice this month! Fix this now." },
    ],
  },
  {
    _id: "t2", customer: "Aman Verma", subject: "Cannot log in after password reset",
    status: "open", sentiment: "frustrated", urgency: "medium", category: "login",
    summary: "Reset email arrived, but the new password is rejected on login.",
    drafts: [
      "Hi Aman, please clear your browser cache and try the reset link once more. If it still fails, tell me and I'll reset it manually.",
      "Hi Aman, I've sent a fresh reset link. It stays valid for 15 minutes.",
    ],
    messages: [
      { from: "customer", text: "I reset my password but it still says invalid credentials." },
      { from: "agent", text: "Thanks for reporting this, checking your account now." },
    ],
  },
  {
    _id: "t3", customer: "Neha Gupta", subject: "How do I export my data?",
    status: "pending", sentiment: "neutral", urgency: "low", category: "technical",
    summary: "Customer asks how to export account data as CSV.",
    drafts: [
      "Hi Neha, go to Settings > Data > Export and choose CSV. The file is emailed within a few minutes.",
    ],
    messages: [{ from: "customer", text: "Is there a way to export everything to CSV?" }],
  },
  {
    _id: "t4", customer: "Karan Singh", subject: "App crashes on the reports page",
    status: "open", sentiment: "frustrated", urgency: "high", category: "technical",
    summary: "The app crashes every time the reports page opens on Android.",
    drafts: [
      "Hi Karan, sorry about the crashes. Which app version and Android version are you on? I'll pass this to engineering.",
    ],
    messages: [{ from: "customer", text: "Reports page crashes my app every single time." }],
  },
  {
    _id: "t5", customer: "Pooja Rao", subject: "Invoice copy needed",
    status: "resolved", sentiment: "neutral", urgency: "low", category: "billing",
    summary: "Customer needed a PDF copy of last month's invoice.",
    drafts: ["Hi Pooja, your invoice is attached. Let me know if you need anything else."],
    messages: [
      { from: "customer", text: "Can you resend my March invoice?" },
      { from: "agent", text: "Sent to your email. Anything else I can help with?" },
    ],
  },
];

const TONE = {
  angry: "bg-red-100 text-red-800",
  frustrated: "bg-amber-100 text-amber-800",
  neutral: "bg-stone-200 text-stone-700",
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-teal-100 text-teal-800",
};

function Badge({ children, tone }) {
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${TONE[tone] || "bg-stone-200 text-stone-700"}`}>
      {children}
    </span>
  );
}

// Simple horizontal bar chart (no chart library needed)
function BarChart({ title, data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-stone-800">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="w-24 capitalize text-stone-600">{d.label}</span>
            <div className="h-3 flex-1 rounded bg-stone-100">
              <div className="h-3 rounded bg-teal-700" style={{ width: `${(d.value / max) * 100}%` }} />
            </div>
            <span className="w-5 text-right text-stone-700">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const countBy = (list, key) =>
  Object.entries(list.reduce((acc, t) => ({ ...acc, [t[key]]: (acc[t[key]] || 0) + 1 }), {})).map(
    ([label, value]) => ({ label, value })
  );

export default function AgentDashboard() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedId, setSelectedId] = useState(INITIAL_TICKETS[0]._id);
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [reply, setReply] = useState("");
  const [toast, setToast] = useState("");

  const visible = useMemo(
    () =>
      tickets.filter(
        (t) =>
          (statusFilter === "all" || t.status === statusFilter) &&
          (urgencyFilter === "all" || t.urgency === urgencyFilter)
      ),
    [tickets, statusFilter, urgencyFilter]
  );
  const selected = tickets.find((t) => t._id === selectedId);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const updateTicket = (id, patch) =>
    setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, ...patch } : t)));

  const sendReply = () => {
    if (!reply.trim()) return notify("Write a reply before sending.");
    updateTicket(selected._id, {
      messages: [...selected.messages, { from: "agent", text: reply.trim() }],
      status: selected.status === "open" ? "pending" : selected.status,
    });
    setReply("");
    notify("Reply sent");
    // Later: axios.post(`/api/tickets/${selected._id}/messages`, { text }) + socket.emit(...)
  };

  const openCount = tickets.filter((t) => t.status === "open").length;
  const urgentCount = tickets.filter((t) => t.urgency === "high" && t.status !== "resolved").length;

  const select = "rounded border border-stone-300 bg-white px-2 py-1 text-sm";

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3">
        <h1 className="text-lg font-semibold text-teal-800">ZenFlow Agent Dashboard</h1>
        <div className="flex gap-4 text-sm text-stone-600">
          <span>{openCount} open</span>
          <span className="font-medium text-red-700">{urgentCount} urgent</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-4 p-4">
        {/* Analytics */}
        <section className="grid gap-4 md:grid-cols-3">
          <BarChart title="Tickets by category" data={countBy(tickets, "category")} />
          <BarChart title="Tickets by sentiment" data={countBy(tickets, "sentiment")} />
          <BarChart title="Tickets by status" data={countBy(tickets, "status")} />
        </section>

        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          {/* Ticket list */}
          <section className="rounded-lg border border-stone-200 bg-white">
            <div className="flex gap-2 border-b border-stone-200 p-3">
              <select className={select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
              <select className={select} value={urgencyFilter} onChange={(e) => setUrgencyFilter(e.target.value)} aria-label="Filter by urgency">
                <option value="all">All urgency</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <ul>
              {visible.length === 0 && (
                <li className="p-4 text-sm text-stone-500">No tickets match these filters. Change a filter to see more.</li>
              )}
              {visible.map((t) => (
                <li key={t._id}>
                  <button
                    onClick={() => { setSelectedId(t._id); setReply(""); }}
                    className={`w-full border-b border-stone-100 p-3 text-left hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 ${
                      t._id === selectedId ? "bg-teal-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.customer}</span>
                      <span className="text-xs capitalize text-stone-500">{t.status}</span>
                    </div>
                    <p className="truncate text-sm text-stone-600">{t.subject}</p>
                    <div className="mt-1 flex gap-1">
                      <Badge tone={t.urgency}>{t.urgency}</Badge>
                      <Badge tone={t.sentiment}>{t.sentiment}</Badge>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Ticket detail */}
          <section className="rounded-lg border border-stone-200 bg-white p-4">
            {!selected ? (
              <p className="text-sm text-stone-500">Select a ticket from the list to read and reply.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold">{selected.subject}</h2>
                    <p className="text-sm text-stone-600">{selected.customer} · {selected.category}</p>
                  </div>
                  {selected.status !== "resolved" ? (
                    <button
                      onClick={() => { updateTicket(selected._id, { status: "resolved" }); notify("Ticket resolved"); }}
                      className="rounded bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                    >
                      Resolve ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => { updateTicket(selected._id, { status: "open" }); notify("Ticket reopened"); }}
                      className="rounded border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50"
                    >
                      Reopen ticket
                    </button>
                  )}
                </div>

                {/* AI summary panel */}
                <div className="mt-3 rounded border-l-4 border-teal-700 bg-teal-50 p-3 text-sm">
                  <p className="font-medium text-teal-900">AI summary</p>
                  <p className="text-stone-700">{selected.summary}</p>
                  <div className="mt-2 flex gap-1">
                    <Badge tone={selected.sentiment}>Sentiment: {selected.sentiment}</Badge>
                    <Badge tone={selected.urgency}>Urgency: {selected.urgency}</Badge>
                  </div>
                </div>

                {/* Conversation */}
                <div className="my-4 space-y-2">
                  {selected.messages.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "agent" ? "justify-end" : ""}`}>
                      <p className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        m.from === "agent" ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-800"
                      }`}>
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* One-click drafts + reply box */}
                <div>
                  <p className="mb-1 text-sm font-medium">Suggested replies</p>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {selected.drafts.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => setReply(d)}
                        className="rounded border border-teal-700 px-2 py-1 text-left text-xs text-teal-800 hover:bg-teal-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                      >
                        Use draft {i + 1}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    placeholder="Write a reply, or pick a suggested draft above"
                    className="w-full rounded border border-stone-300 p-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  />
                  <button
                    onClick={sendReply}
                    className="mt-2 rounded bg-teal-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    Send reply
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {toast && (
        <div role="status" className="fixed bottom-4 right-4 rounded bg-stone-900 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}