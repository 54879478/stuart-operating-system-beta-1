"use client";

import { useEffect, useState } from "react";

type Screen = "welcome" | "create" | "room";

type Section =
  | "company-room"
  | "today"
  | "signals"
  | "tasks"
  | "documents"
  | "decisions"
  | "settings";

type TaskStatus =
  | "Waiting for approval"
  | "Approved"
  | "Skipped"
  | "Draft prepared";

type CompanyProfile = {
  companyName: string;
  description: string;
  stage: string;
  mainGoal: string;
  bottleneck: string;
};

type Task = {
  id: number;
  title: string;
  owner: string;
  status: TaskStatus;
  source: string;
  draft?: string;
};

type DocumentItem = {
  id: number;
  title: string;
  type: string;
  content: string;
  sourceTaskId?: number;
};

type Decision = {
  id: number;
  title: string;
  reason: string;
  impact: string;
  sourceTaskId?: number;
};

type Signal = {
  id: number;
  title: string;
  type: string;
  description: string;
  importance: "Low" | "Medium" | "High";
};

const emptyCompanyProfile: CompanyProfile = {
  companyName: "",
  description: "",
  stage: "Idea",
  mainGoal: "",
  bottleneck: "",
};

const navItems: { label: string; value: Section }[] = [
  { label: "Company Room", value: "company-room" },
  { label: "Today", value: "today" },
  { label: "Signals", value: "signals" },
  { label: "Tasks", value: "tasks" },
  { label: "Documents", value: "documents" },
  { label: "Decisions", value: "decisions" },
  { label: "Settings", value: "settings" },
];

const taskIdeas = [
  {
    title: "Define the first customer segment",
    source: "AI Advisor",
    draft:
      "Draft: Your first customer segment may be solo founders who feel overwhelmed by scattered tasks, documents, decisions, and business signals.",
  },
  {
    title: "Write the first landing page promise",
    source: "Company Map",
    draft:
      "Draft: AI Company Run helps one-person companies turn scattered work into a calm company operating room with tasks, documents, signals, and decisions.",
  },
  {
    title: "Create 5 customer discovery questions",
    source: "Signals",
    draft:
      "Draft: Ask potential users where their company information lives, what decisions they forget, what tasks feel repetitive, what tools they already use, and what they wish an AI operator could prepare for them.",
  },
  {
    title: "Prepare a weekly company brief format",
    source: "Today Brief",
    draft:
      "Draft: Weekly brief structure: what changed, what matters, what is stuck, what decisions were made, what tasks need approval, and what should happen next week.",
  },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [activeSection, setActiveSection] =
    useState<Section>("company-room");
  const [companyProfile, setCompanyProfile] =
    useState<CompanyProfile>(emptyCompanyProfile);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [predictiveAssistance, setPredictiveAssistance] = useState(true);
  const [companyMemory, setCompanyMemory] = useState(true);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("ai-company-run-v01");

    window.setTimeout(() => {
      if (saved) {
        const parsed = JSON.parse(saved) as {
          companyProfile: CompanyProfile;
          tasks: Task[];
          documents: DocumentItem[];
          decisions: Decision[];
          predictiveAssistance: boolean;
          companyMemory: boolean;
        };

        setCompanyProfile(parsed.companyProfile);
        setTasks(parsed.tasks);
        setDocuments(parsed.documents);
        setDecisions(parsed.decisions);
        setPredictiveAssistance(parsed.predictiveAssistance);
        setCompanyMemory(parsed.companyMemory);

        if (
          parsed.companyProfile.companyName ||
          parsed.companyProfile.description
        ) {
          setScreen("room");
        }
      }

      setHasLoadedStorage(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    window.localStorage.setItem(
      "ai-company-run-v01",
      JSON.stringify({
        companyProfile,
        tasks,
        documents,
        decisions,
        predictiveAssistance,
        companyMemory,
      })
    );
  }, [
    hasLoadedStorage,
    companyProfile,
    tasks,
    documents,
    decisions,
    predictiveAssistance,
    companyMemory,
  ]);

  function updateCompanyProfile(field: keyof CompanyProfile, value: string) {
    setCompanyProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  }

  function generateCompanyRoom() {
    setScreen("room");
    setActiveSection("company-room");
  }

  function createOperatingTask(source = "AI Operator") {
    const nextIdea = taskIdeas[tasks.length % taskIdeas.length];

    const newTask: Task = {
      id: tasks.length + 1,
      title: nextIdea.title,
      owner: "AI Operator",
      status: "Waiting for approval",
      source,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setActiveSection("tasks");
  }

  function createDraft(task: Task) {
    const idea = taskIdeas.find((taskIdea) => taskIdea.title === task.title);
    const draftContent =
      idea?.draft ||
      "Draft: The AI Operator prepared an operating draft based on this task.";

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              status: "Draft prepared",
              draft: draftContent,
            }
          : currentTask
      )
    );

    setDocuments((currentDocuments) => {
      const alreadyExists = currentDocuments.some(
        (document) => document.sourceTaskId === task.id
      );

      if (alreadyExists) {
        return currentDocuments;
      }

      const newDocument: DocumentItem = {
        id: task.id,
        title: task.title,
        type: "AI prepared draft",
        content: draftContent,
        sourceTaskId: task.id,
      };

      return [newDocument, ...currentDocuments];
    });

    setActiveSection("documents");
  }

  function approveTask(task: Task) {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              status: "Approved",
            }
          : currentTask
      )
    );

    setDecisions((currentDecisions) => {
      const alreadyExists = currentDecisions.some(
        (decision) => decision.sourceTaskId === task.id
      );

      if (alreadyExists) {
        return currentDecisions;
      }

      const newDecision: Decision = {
        id: task.id,
        title: task.title,
        reason:
          "The user approved this AI prepared operating task. It is now part of the company memory.",
        impact:
          "This creates a clearer next step and reduces decision drift for the one-person company.",
        sourceTaskId: task.id,
      };

      return [newDecision, ...currentDecisions];
    });

    setActiveSection("decisions");
  }

  function skipTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "Skipped",
            }
          : task
      )
    );
  }

  function resetPrototype() {
    window.localStorage.removeItem("ai-company-run-v01");
    setScreen("welcome");
    setActiveSection("company-room");
    setCompanyProfile(emptyCompanyProfile);
    setTasks([]);
    setDocuments([]);
    setDecisions([]);
    setPredictiveAssistance(true);
    setCompanyMemory(true);
  }

  function getCompanyName() {
    return companyProfile.companyName || "Untitled Company";
  }

  function getAdvisorNextStep() {
    if (!companyProfile.mainGoal) {
      return "Complete the company goal so the AI operating room has a clearer direction.";
    }

    if (tasks.length === 0) {
      return "Create your first operating task so the AI Operator can begin preparing work for you.";
    }

    const latestTask = tasks[0];

    if (latestTask.status === "Waiting for approval") {
      return "Review the prepared task. Approve it, skip it, or ask the AI Operator to prepare a draft.";
    }

    if (latestTask.status === "Draft prepared") {
      return "Review the prepared draft and decide whether it should become a company decision.";
    }

    if (latestTask.status === "Approved") {
      return "The task is approved. Next, turn the approved decision into today&apos;s concrete work.";
    }

    if (latestTask.status === "Skipped") {
      return "The task was skipped. Ask the AI Operator to prepare a better option.";
    }

    return "Review your current operating state and choose the next company action.";
  }

  function getSignals(): Signal[] {
    return [
      {
        id: 1,
        title: "Customer clarity is still thin",
        type: "Customer signal",
        description:
          "The company room has a product direction, but the first painful customer segment still needs sharper definition.",
        importance: "High",
      },
      {
        id: 2,
        title: "Document gap detected",
        type: "Document signal",
        description:
          "There is no approved customer brief yet. This may make future tasks and AI advice less precise.",
        importance: "Medium",
      },
      {
        id: 3,
        title: "Founder bottleneck declared",
        type: "Operations signal",
        description:
          companyProfile.bottleneck ||
          "The system does not yet know the founder&apos;s biggest operating bottleneck.",
        importance: companyProfile.bottleneck ? "High" : "Medium",
      },
      {
        id: 4,
        title: "Trust boundary required",
        type: "Trust signal",
        description:
          "Future Gmail and document connections should detect company signals, not monitor private life.",
        importance: "High",
      },
    ];
  }

  function getCompanyNodes() {
    return [
      {
        name: "Product",
        status: companyProfile.description || "No product description yet.",
        question: "What is the smallest painful use case this product solves?",
      },
      {
        name: "Customers",
        status:
          documents.length > 0
            ? "Customer brief draft exists."
            : "First customer segment not approved yet.",
        question: "Who feels this problem every day?",
      },
      {
        name: "Market",
        status: "Category and competitors are not mapped yet.",
        question: "What existing tool does the user currently replace?",
      },
      {
        name: "Operations",
        status: companyProfile.bottleneck || "No bottleneck declared yet.",
        question: "What is slowing the founder down right now?",
      },
      {
        name: "Finance",
        status: "Revenue model not defined in this prototype.",
        question: "How does this product eventually make money?",
      },
      {
        name: "Documents",
        status: `${documents.length} prepared document${documents.length === 1 ? "" : "s"}.`,
        question: "What document would make the next decision easier?",
      },
    ];
  }

  function getStatusClass(status: TaskStatus) {
    if (status === "Approved") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "Skipped") {
      return "bg-neutral-100 text-neutral-500";
    }

    if (status === "Draft prepared") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-[#f7f6f2] text-neutral-500";
  }

  function renderTaskCard(task: Task) {
    return (
      <div
        key={task.id}
        className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-neutral-400">
              {task.owner} · {task.source}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-neutral-950">
              {task.title}
            </h3>
          </div>

          <span className={`rounded-full px-3 py-1 text-xs ${getStatusClass(task.status)}`}>
            {task.status}
          </span>
        </div>

        {task.draft && (
          <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4 text-sm leading-6 text-neutral-600">
            {task.draft}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => approveTask(task)}
            className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            Approve
          </button>

          <button
            onClick={() => skipTask(task.id)}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Skip
          </button>

          <button
            onClick={() => createDraft(task)}
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Create Draft
          </button>
        </div>
      </div>
    );
  }

  function renderActiveSection() {
    if (activeSection === "company-room") {
      return (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-neutral-500">Company Room</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
                {getCompanyName()}
              </h1>
            </div>

            <button
              onClick={() => setScreen("create")}
              className="rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-sm text-neutral-600 shadow-sm transition hover:bg-white"
            >
              Edit company
            </button>
          </div>

          <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
            <p className="text-sm text-neutral-500">Company core</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              {companyProfile.description || "No description yet."}
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-[#f7f6f2] p-4">
                <p className="text-xs text-neutral-400">Stage</p>
                <p className="mt-2 text-sm font-medium text-neutral-800">
                  {companyProfile.stage}
                </p>
              </div>

              <div className="rounded-3xl bg-[#f7f6f2] p-4">
                <p className="text-xs text-neutral-400">Main goal</p>
                <p className="mt-2 text-sm font-medium text-neutral-800">
                  {companyProfile.mainGoal || "Not set yet"}
                </p>
              </div>

              <div className="rounded-3xl bg-[#f7f6f2] p-4">
                <p className="text-xs text-neutral-400">Bottleneck</p>
                <p className="mt-2 text-sm font-medium text-neutral-800">
                  {companyProfile.bottleneck || "Not set yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[2.25rem] border border-neutral-200 bg-white/60 p-6 shadow-sm">
            <div className="mx-auto mb-6 w-fit rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm">
              Company Core
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {getCompanyNodes().map((node) => (
                <div
                  key={node.name}
                  className="rounded-[2rem] border border-neutral-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
                >
                  <p className="text-sm text-neutral-400">Node</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                    {node.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">
                    {node.status}
                  </p>
                  <p className="mt-4 rounded-2xl bg-[#f7f6f2] p-4 text-sm leading-6 text-neutral-500">
                    Next question: {node.question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (activeSection === "today") {
      const waitingTasks = tasks.filter(
        (task) => task.status === "Waiting for approval"
      );

      return (
        <div>
          <p className="text-sm text-neutral-500">Today</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Today&apos;s operating brief
          </h1>

          <div className="mt-8 grid gap-5">
            <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
              <p className="text-sm font-semibold text-neutral-950">
                Top priority
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {companyProfile.mainGoal ||
                  "Set a main company goal so the AI operating room can focus today&apos;s work."}
              </p>
            </div>

            <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
              <p className="text-sm font-semibold text-neutral-950">
                Pending approvals
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {waitingTasks.length === 0
                  ? "No pending approvals yet."
                  : `${waitingTasks.length} task${waitingTasks.length === 1 ? "" : "s"} waiting for approval.`}
              </p>
            </div>

            <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
              <p className="text-sm font-semibold text-neutral-950">
                Open loop
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-500">
                {companyProfile.bottleneck ||
                  "The current bottleneck is not defined yet."}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "signals") {
      return (
        <div>
          <p className="text-sm text-neutral-500">Signals</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Company signals
          </h1>

          <div className="mt-8 space-y-3">
            {getSignals().map((signal) => (
              <div
                key={signal.id}
                className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-400">{signal.type}</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                      {signal.title}
                    </h2>
                  </div>

                  <span className="rounded-full bg-[#f7f6f2] px-3 py-1 text-xs text-neutral-500">
                    {signal.importance}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-neutral-500">
                  {signal.description}
                </p>

                <button
                  onClick={() => createOperatingTask(signal.title)}
                  className="mt-5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-white"
                >
                  Prepare task from signal
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeSection === "tasks") {
      return (
        <div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">AI Operator</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
                Operating Tasks
              </h1>
            </div>

            <button
              onClick={() => createOperatingTask()}
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Create Operating Task
            </button>
          </div>

          <div className="mt-8 space-y-3">
            {tasks.length === 0 ? (
              <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
                <p className="text-sm leading-6 text-neutral-500">
                  No operating tasks yet. Let the AI Operator prepare the first
                  task for your company.
                </p>
              </div>
            ) : (
              tasks.map((task) => renderTaskCard(task))
            )}
          </div>
        </div>
      );
    }

    if (activeSection === "documents") {
      return (
        <div>
          <p className="text-sm text-neutral-500">Documents</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Prepared documents
          </h1>

          <div className="mt-8 space-y-3">
            {documents.length === 0 ? (
              <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
                <p className="text-sm leading-6 text-neutral-500">
                  No documents yet. Ask the AI Operator to create a draft from a
                  task.
                </p>
              </div>
            ) : (
              documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm"
                >
                  <p className="text-sm text-neutral-400">{document.type}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                    {document.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-neutral-600">
                    {document.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeSection === "decisions") {
      return (
        <div>
          <p className="text-sm text-neutral-500">Decisions</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Operating decisions
          </h1>

          <div className="mt-8 space-y-3">
            {decisions.length === 0 ? (
              <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
                <p className="text-sm leading-6 text-neutral-500">
                  No approved decisions yet. Approved tasks will become part of
                  your company memory.
                </p>
              </div>
            ) : (
              decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm"
                >
                  <p className="text-sm text-neutral-400">Approved decision</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                    {decision.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-neutral-500">
                    Reason: {decision.reason}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    Impact: {decision.impact}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <p className="text-sm text-neutral-500">Settings</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
          Trust Center
        </h1>

        <div className="mt-8 grid gap-4">
          <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Company memory
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Store approved decisions, prepared documents, and company
                  context. This prototype only uses localStorage on your device.
                </p>
              </div>

              <button
                onClick={() => setCompanyMemory((current) => !current)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  companyMemory
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {companyMemory ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Predictive assistance
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  The AI may suggest what you need next, but it must always
                  explain why.
                </p>
              </div>

              <button
                onClick={() =>
                  setPredictiveAssistance((current) => !current)
                }
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  predictiveAssistance
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {predictiveAssistance ? "On" : "Off"}
              </button>
            </div>
          </div>

          {[
            "AI prepares, user approves.",
            "Gmail will be used for company signals, not private monitoring.",
            "Company memory is separate from private life.",
            "User can skip, delete, disconnect, or ignore.",
          ].map((principle) => (
            <div
              key={principle}
              className="rounded-[2rem] border border-neutral-200 bg-white/70 p-5 text-sm text-neutral-600 shadow-sm"
            >
              {principle}
            </div>
          ))}

          <button
            onClick={resetPrototype}
            className="rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
          >
            Reset prototype data
          </button>
        </div>
      </div>
    );
  }

  if (screen === "create") {
    return (
      <main className="min-h-screen bg-[#f7f6f2] text-[#171717]">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-8 py-10">
          <header className="flex items-center justify-between">
            <button
              onClick={() => setScreen("welcome")}
              className="text-sm font-medium text-neutral-500 transition hover:text-neutral-950"
            >
              ← Back
            </button>

            <div className="text-sm font-medium tracking-tight">
              AI Company Run
            </div>
          </header>

          <section className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-2xl rounded-[2rem] border border-neutral-200 bg-white/70 p-8 shadow-sm backdrop-blur">
              <div className="mb-6 inline-flex rounded-full border border-neutral-200 bg-[#f7f6f2] px-4 py-2 text-sm text-neutral-500">
                Create Company Room
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-950 md:text-5xl">
                Build the operating room for your company.
              </h1>

              <p className="mt-5 text-base leading-7 text-neutral-600">
                Give the system enough context to create a useful company room.
                Start simple. You can edit this later.
              </p>

              <div className="mt-8 grid gap-4">
                <input
                  value={companyProfile.companyName}
                  onChange={(event) =>
                    updateCompanyProfile("companyName", event.target.value)
                  }
                  placeholder="Company name"
                  className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />

                <textarea
                  value={companyProfile.description}
                  onChange={(event) =>
                    updateCompanyProfile("description", event.target.value)
                  }
                  placeholder="One-line description. Example: I am building an AI operating system for one-person companies."
                  className="min-h-32 resize-none rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />

                <select
                  value={companyProfile.stage}
                  onChange={(event) =>
                    updateCompanyProfile("stage", event.target.value)
                  }
                  className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 outline-none transition focus:border-neutral-400"
                >
                  <option>Idea</option>
                  <option>Prototype</option>
                  <option>Pre-launch</option>
                  <option>Launched</option>
                  <option>Growing</option>
                </select>

                <input
                  value={companyProfile.mainGoal}
                  onChange={(event) =>
                    updateCompanyProfile("mainGoal", event.target.value)
                  }
                  placeholder="Main goal. Example: Build a working prototype this month."
                  className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />

                <input
                  value={companyProfile.bottleneck}
                  onChange={(event) =>
                    updateCompanyProfile("bottleneck", event.target.value)
                  }
                  placeholder="Biggest bottleneck. Example: I do not know the first customer segment yet."
                  className="rounded-3xl border border-neutral-200 bg-white px-5 py-4 text-base text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>

              <button
                onClick={generateCompanyRoom}
                disabled={
                  companyProfile.companyName.trim().length === 0 ||
                  companyProfile.description.trim().length === 0
                }
                className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                Generate Company Room
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (screen === "room") {
    return (
      <main className="min-h-screen bg-[#f7f6f2] text-[#171717]">
        <div className="grid min-h-screen grid-cols-[240px_1fr_360px]">
          <aside className="border-r border-neutral-200 bg-white/50 px-6 py-8">
            <div className="text-sm font-semibold tracking-tight">
              AI Company Run
            </div>

            <nav className="mt-10 space-y-2 text-sm text-neutral-500">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setActiveSection(item.value)}
                  className={`w-full rounded-full px-4 py-2 text-left transition ${
                    activeSection === item.value
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-500 hover:bg-white hover:text-neutral-950"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="px-10 py-8">{renderActiveSection()}</section>

          <aside className="border-l border-neutral-200 bg-white/60 px-6 py-8">
            <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 inline-flex rounded-full bg-[#f7f6f2] px-3 py-1 text-xs text-neutral-500">
                AI Advisor
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">
                    What happened?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Your company room is active. The system now separates tasks,
                    documents, decisions, signals, and trust controls.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">
                    Why it matters?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    A one-person company needs a shared operating context, not
                    scattered notes and endless chat.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">
                    What should you do next?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {getAdvisorNextStep()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-neutral-950">
                Trust principle
              </p>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                AI prepares. You approve. This prototype stores data only in your
                browser localStorage.
              </p>
            </div>
          </aside>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#171717]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-8 py-10">
        <header className="flex items-center justify-between">
          <div className="text-sm font-medium tracking-tight">
            AI Company Run
          </div>

          <nav className="hidden gap-8 text-sm text-neutral-500 md:flex">
            <span>Company Room</span>
            <span>AI Operator</span>
            <span>Advisor</span>
          </nav>
        </header>

        <section className="flex flex-1 items-center">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex rounded-full border border-neutral-200 bg-white/70 px-4 py-2 text-sm text-neutral-500 shadow-sm">
              For one-person companies
            </div>

            <h1 className="text-5xl font-semibold tracking-[-0.04em] text-neutral-950 md:text-7xl">
              Your AI operating system for a one-person company.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600 md:text-xl">
              Not a chat tool. Not a project manager. AI Company Run gives you a
              quiet company room with an AI operating team behind you.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setScreen("create")}
                className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
              >
                Create Company Room
              </button>

              <button
                onClick={() => {
                  setScreen("create");
                  setCompanyProfile({
                    companyName: "AI Company Run",
                    description:
                      "An AI operating system for one-person companies.",
                    stage: "Prototype",
                    mainGoal:
                      "Build a working product shell and test the first operating flow.",
                    bottleneck:
                      "The core AI engine and company state logic are not built yet.",
                  });
                }}
                className="rounded-full border border-neutral-200 bg-white/70 px-6 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-white"
              >
                Use demo company
              </button>
            </div>
          </div>
        </section>

        <footer className="pb-4 text-sm text-neutral-400">
          AI prepares. You approve.
        </footer>
      </div>
    </main>
  );
}
