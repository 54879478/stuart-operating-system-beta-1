"use client";

import { useEffect, useState } from "react";
import { generateCompanyState } from "@/lib/companyState";
import {
  createQuickCaptureSignal,
  type CompanySignal,
} from "@/lib/companySignal";

type Screen = "welcome" | "create" | "room";

type Section =
  | "company-room"
  | "today"
  | "signals"
  | "operator"
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
  context?: string;
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

type AdvisorResponse = {
  whatHappened: string;
  whyItMatters: string;
  whatToDoNext: string;
};

type WorkOrderStatus = "Assigned" | "Prepared";

type DeliverableType =
  | "Prepare task list"
  | "Draft document"
  | "Summarize signals"
  | "Create follow-up plan"
  | "Generate decision brief"
  | "Summarize internal signals"
  | "Research market signals"
  | "Find customer pain points"
  | "Prepare launch ideas"
  | "Prepare execution plan";

type OperatorWorkOrder = {
  id: number;
  title: string;
  request: string;
  deliverableType: DeliverableType;
  dueText: string;
  sourceContext: string;
  status: WorkOrderStatus;
  preparedOutput?: string;
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
  { label: "Operator", value: "operator" },
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
  const [advisorResponse, setAdvisorResponse] =
    useState<AdvisorResponse | null>(null);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState("");
  const [quickCaptureInput, setQuickCaptureInput] = useState("");
  const [companySignals, setCompanySignals] = useState<CompanySignal[]>([]);
  const [workOrders, setWorkOrders] = useState<OperatorWorkOrder[]>([]);
  const [runningMissionId, setRunningMissionId] = useState<number | null>(null);
  const [workOrderRequest, setWorkOrderRequest] = useState("");
  const [workOrderDeliverableType, setWorkOrderDeliverableType] =
    useState<DeliverableType>("Research market signals");
  const [workOrderDueText, setWorkOrderDueText] = useState("Tomorrow morning");
  const [workOrderSourceContext, setWorkOrderSourceContext] = useState(
    "Company profile, recent signals, and the market area you want the operator to investigate"
  );
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  const companyState = generateCompanyState(
    companyProfile,
    tasks,
    documents,
    decisions,
    companySignals
  );
  function getSeverityStyles(severity?: string) {
    if (severity === "Red") {
      return {
        card: "border-2",
        badge: "",
        cardStyle: {
          borderColor: "#D64545",
          backgroundColor: "#fff1f1",
        },
        badgeStyle: {
          backgroundColor: "#D64545",
          color: "#ffffff",
        },
      };
    }

    if (severity === "Yellow") {
      return {
        card: "border-2",
        badge: "",
        cardStyle: {
          borderColor: "#D9A441",
          backgroundColor: "#fff8e8",
        },
        badgeStyle: {
          backgroundColor: "#D9A441",
          color: "#ffffff",
        },
      };
    }

    if (severity === "Green") {
      return {
        card: "border-2",
        badge: "",
        cardStyle: {
          borderColor: "#4C9A68",
          backgroundColor: "#f0fbf4",
        },
        badgeStyle: {
          backgroundColor: "#4C9A68",
          color: "#ffffff",
        },
      };
    }

    return {
      card: "border border-neutral-200 bg-white/80",
      badge: "bg-[#f7f6f2] text-neutral-500",
      cardStyle: {},
      badgeStyle: {},
    };
  }

  useEffect(() => {
    const saved = window.localStorage.getItem("ai-company-run-v01");

    window.setTimeout(() => {
      if (saved) {
        const parsed = JSON.parse(saved) as {
          companyProfile: CompanyProfile;
          tasks: Task[];
          documents: DocumentItem[];
          decisions: Decision[];
          companySignals?: CompanySignal[];
          workOrders?: OperatorWorkOrder[];
          predictiveAssistance: boolean;
          companyMemory: boolean;
        };

        setCompanyProfile(parsed.companyProfile);
        setTasks(parsed.tasks);
        setDocuments(parsed.documents);
        setDecisions(parsed.decisions);
        setCompanySignals(parsed.companySignals || []);
        setWorkOrders(parsed.workOrders || []);
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
        companySignals,
        workOrders,
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
    companySignals,
    workOrders,
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

  function analyzeQuickCapture() {
    const trimmedInput = quickCaptureInput.trim();

    if (!trimmedInput) {
      return;
    }

    const newSignal = createQuickCaptureSignal(
      trimmedInput,
      companySignals.length + 1
    );

    setCompanySignals((currentSignals) => [newSignal, ...currentSignals]);
    setQuickCaptureInput("");
    setActiveSection("signals");
  }

  function createTaskFromSignal(signal: CompanySignal) {
    const newTask: Task = {
      id: tasks.length + 1,
      title: signal.recommendedAction,
      owner: "AI Operator",
      status: "Waiting for approval",
      source: `Signal: ${signal.title}`,
      context: signal.whyItMatters,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setActiveSection("tasks");
  }

  function assignSignalToOperator(signal: CompanySignal) {
    const request = `Prepare a reviewable deliverable for this company signal: ${signal.title}. Recommended action: ${signal.recommendedAction}`;

    const newWorkOrder: OperatorWorkOrder = {
      id: workOrders.length + 1,
      title:
        signal.recommendedAction.length > 60
          ? `${signal.recommendedAction.slice(0, 57)}...`
          : signal.recommendedAction,
      request,
      deliverableType: "Prepare task list",
      dueText: "Today",
      sourceContext: `${signal.severity} ${signal.node} signal from ${signal.source}. Why it matters: ${signal.whyItMatters}`,
      status: "Assigned",
    };

    setWorkOrders((currentWorkOrders) => [newWorkOrder, ...currentWorkOrders]);
    setActiveSection("operator");
  }

  function ignoreSignal(signalId: number) {
    setCompanySignals((currentSignals) =>
      currentSignals.filter((signal) => signal.id !== signalId)
    );
  }

  function createTaskFromAdvisorAdvice() {
    if (!advisorResponse?.whatToDoNext) {
      return;
    }

    const newTask: Task = {
      id: tasks.length + 1,
      title: advisorResponse.whatToDoNext,
      owner: "AI Operator",
      status: "Waiting for approval",
      source: "AI Advisor",
      context: advisorResponse.whyItMatters,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setActiveSection("tasks");
  }

  function assignAdvisorAdviceToOperator() {
    if (!advisorResponse?.whatToDoNext) {
      return;
    }

    const request = `Prepare a reviewable deliverable for this AI Advisor recommendation: ${advisorResponse.whatToDoNext}`;

    const newWorkOrder: OperatorWorkOrder = {
      id: workOrders.length + 1,
      title:
        advisorResponse.whatToDoNext.length > 60
          ? `${advisorResponse.whatToDoNext.slice(0, 57)}...`
          : advisorResponse.whatToDoNext,
      request,
      deliverableType: "Prepare task list",
      dueText: "Today",
      sourceContext: `AI Advisor recommendation. Why it matters: ${advisorResponse.whyItMatters}`,
      status: "Assigned",
    };

    setWorkOrders((currentWorkOrders) => [newWorkOrder, ...currentWorkOrders]);
    setActiveSection("operator");
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

  function saveTodayBriefAsDocument() {
    const latestSignal = companySignals[0];
    const waitingTasks = tasks.filter(
      (task) => task.status === "Waiting for approval"
    );

    const briefContent = `Today Operating Brief

Company: ${getCompanyName()}
Stage: ${companyProfile.stage}
Main goal: ${companyProfile.mainGoal || "Not set yet"}
Bottleneck: ${companyProfile.bottleneck || "Not set yet"}

Top priority:
${companyState.topPriority}

Latest company signal:
${
  latestSignal
    ? `${latestSignal.severity} ${latestSignal.node} signal — ${latestSignal.title}. Recommended action: ${latestSignal.recommendedAction}`
    : "No company signals captured yet."
}

Pending approvals:
${
  waitingTasks.length === 0
    ? "No pending approvals."
    : waitingTasks.map((task) => `- ${task.title}`).join("\n")
}

Recommended next move:
${latestSignal ? latestSignal.recommendedAction : companyState.topPriority}`;

    const newDocument: DocumentItem = {
      id: documents.length + 1,
      title: "Today Operating Brief",
      type: "Daily brief",
      content: briefContent,
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setActiveSection("documents");
  }

  function saveWeeklyReviewAsDocument() {
    const redSignals = companySignals.filter(
      (signal) => signal.severity === "Red"
    );
    const yellowSignals = companySignals.filter(
      (signal) => signal.severity === "Yellow"
    );
    const approvedTasks = tasks.filter((task) => task.status === "Approved");
    const waitingTasks = tasks.filter(
      (task) => task.status === "Waiting for approval"
    );

    const weeklyReviewContent = `Weekly Operating Review

Company: ${getCompanyName()}
Stage: ${companyProfile.stage}
Main goal: ${companyProfile.mainGoal || "Not set yet"}
Bottleneck: ${companyProfile.bottleneck || "Not set yet"}

Signal summary:
- Red signals: ${redSignals.length}
- Yellow signals: ${yellowSignals.length}
- Total signals: ${companySignals.length}

Latest signals:
${
  companySignals.length === 0
    ? "No company signals captured yet."
    : companySignals
        .slice(0, 5)
        .map(
          (signal) =>
            `- ${signal.severity} ${signal.node}: ${signal.title}. Recommended action: ${signal.recommendedAction}`
        )
        .join("\n")
}

Task summary:
- Approved tasks: ${approvedTasks.length}
- Waiting for approval: ${waitingTasks.length}
- Total tasks: ${tasks.length}

Decisions made:
${
  decisions.length === 0
    ? "No approved decisions yet."
    : decisions
        .slice(0, 5)
        .map((decision) => `- ${decision.title}`)
        .join("\n")
}

Recommended focus for next week:
${companyState.topPriority}`;

    const newDocument: DocumentItem = {
      id: documents.length + 1,
      title: "Weekly Operating Review",
      type: "Weekly review",
      content: weeklyReviewContent,
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setActiveSection("documents");
  }

  function approveDocumentAsDecision(document: DocumentItem) {
    setDecisions((currentDecisions) => {
      const alreadyExists = currentDecisions.some(
        (decision) => decision.id === document.id
      );

      if (alreadyExists) {
        return currentDecisions;
      }

      const newDecision: Decision = {
        id: document.id,
        title: document.title,
        reason:
          "The user approved this prepared document as part of the company operating memory.",
        impact:
          "This turns a prepared brief or draft into a recorded company decision that can guide future work.",
        sourceTaskId: document.sourceTaskId,
      };

      return [newDecision, ...currentDecisions];
    });

    setActiveSection("decisions");
  }

  function createDraft(task: Task) {
    const idea = taskIdeas.find((taskIdea) => taskIdea.title === task.title);
    const draftContent =
      idea?.draft ||
      `Draft: ${task.title}

Operating context: ${
        task.context ||
        "This task was prepared from the current company operating state."
      }

Suggested output: Turn this task into a short operating memo with a clear decision, next action, and owner.`;

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
    setCompanySignals([]);
    setWorkOrders([]);
    setWorkOrderRequest("");
    setWorkOrderDeliverableType("Research market signals");
    setWorkOrderDueText("Tomorrow morning");
    setWorkOrderSourceContext(
      "Company profile, recent signals, and the market area you want the operator to investigate"
    );
    setPredictiveAssistance(true);
    setCompanyMemory(true);
  }

  function applyMissionTemplate(template: {
    request: string;
    deliverableType: DeliverableType;
    dueText: string;
    sourceContext: string;
  }) {
    setWorkOrderRequest(template.request);
    setWorkOrderDeliverableType(template.deliverableType);
    setWorkOrderDueText(template.dueText);
    setWorkOrderSourceContext(template.sourceContext);
  }

  function createOperatorWorkOrder() {
    const trimmedRequest = workOrderRequest.trim();

    if (!trimmedRequest) {
      return;
    }

    const title =
      trimmedRequest.length > 60
        ? `${trimmedRequest.slice(0, 57)}...`
        : trimmedRequest;

    const newWorkOrder: OperatorWorkOrder = {
      id: workOrders.length + 1,
      title,
      request: trimmedRequest,
      deliverableType: workOrderDeliverableType,
      dueText: workOrderDueText,
      sourceContext: workOrderSourceContext,
      status: "Assigned",
    };

    setWorkOrders((currentWorkOrders) => [newWorkOrder, ...currentWorkOrders]);
    setWorkOrderRequest("");
  }

  function buildOperatorDeliverable(workOrder: OperatorWorkOrder) {
    const recentSignalsText =
      companySignals.length === 0
        ? "No company signals captured yet."
        : companySignals
            .slice(0, 5)
            .map(
              (signal) =>
                `- ${signal.severity} ${signal.node}: ${signal.title}. ${signal.summary}`
            )
            .join("\n");

    const recentDecisionsText =
      decisions.length === 0
        ? "No approved decisions yet."
        : decisions
            .slice(0, 5)
            .map(
              (decision) =>
                `- ${decision.title}. Reason: ${decision.reason}. Impact: ${decision.impact}`
            )
            .join("\n");

    let preparedBody = "";

    switch (workOrder.deliverableType) {
      case "Summarize internal signals":
        preparedBody = `Internal signal mission brief:

What I reviewed:
${recentSignalsText}

What this means:
The company currently has ${companySignals.length} captured signal${companySignals.length === 1 ? "" : "s"}. The operator should help the founder identify which signals need action, which can wait, and which should become tasks or decisions.

Suggested actions:
1. Review the highest-severity signal first
2. Convert one signal into a task
3. Assign one unclear signal back to the operator for deeper preparation
4. Save any important pattern into company memory`;
        break;
      case "Research market signals":
        preparedBody = `Research mission brief:

Mission:
${workOrder.request}

Research target:
${workOrder.sourceContext}

What the operator should look for:
1. Market changes that could affect the company
2. Competitors or tools solving a similar problem
3. Repeated customer pain points
4. Content, launch, or positioning opportunities
5. Risks the founder should not ignore

Prepared research output:
- Search angle 1: Who is already trying to solve this problem?
- Search angle 2: What are users complaining about in this market?
- Search angle 3: What new trends or tools are appearing?
- Search angle 4: What should our product do differently?

Suggested next action:
Turn this research mission into either a customer pain point list, a launch idea list, or a competitor brief.

Note:
This prototype is preparing the research mission format. Real web search can be connected later through a search API.`;
        break;
      case "Find customer pain points":
        preparedBody = `Customer pain point mission:

Mission:
${workOrder.request}

Target context:
${workOrder.sourceContext}

Pain points to investigate:
1. What users are currently doing manually
2. What tools feel scattered or annoying
3. What moments make users feel overwhelmed
4. What users already pay for
5. What users might urgently want solved

Prepared output:
- Pain point hypothesis 1: Users have too many scattered company signals
- Pain point hypothesis 2: Users do not know what to do next after receiving information
- Pain point hypothesis 3: Users want AI to prepare work, not just answer questions
- Pain point hypothesis 4: Users need approval control before AI takes action

Suggested next action:
Create 5 customer discovery questions from these pain points.`;
        break;
      case "Prepare launch ideas":
        preparedBody = `Launch idea mission:

Mission:
${workOrder.request}

Company context:
${getCompanyName()} is building toward: ${companyProfile.mainGoal || "Not set yet"}

Possible launch angles:
1. "Stop asking AI questions. Start assigning AI work."
2. "An AI operating room for one-person companies."
3. "Turn company signals into tasks, documents, and decisions."
4. "AI prepares. Founder approves."
5. "A calm command center for solo founders."

Suggested launch assets:
- One short product demo
- One landing page promise
- One founder story post
- One before/after workflow screenshot
- One waitlist call to action

Suggested next action:
Choose one launch angle and turn it into a task or document draft.`;
        break;
      case "Prepare execution plan":
        preparedBody = `Execution prep mission:

Mission:
${workOrder.request}

Due: ${workOrder.dueText}

Execution plan:
1. Define the outcome clearly
2. Identify the next visible product improvement
3. Break the work into small tasks
4. Decide what needs founder approval
5. Save the final output as a task, document, or decision

Recommended first task:
Create one concrete operating task that can be completed today.

Approval checkpoint:
The AI Operator should not execute external actions. The founder must approve before sending, publishing, buying, deleting, or committing.`;
        break;
      case "Prepare task list":
        preparedBody = `Suggested task list based on the work request:

1. Clarify the scope of: ${workOrder.request}
2. Review source context: ${workOrder.sourceContext}
3. Turn the highest-priority item into one operating task
4. Review pending approvals before starting new work
5. Schedule follow-up before ${workOrder.dueText}`;
        break;
      case "Draft document":
        preparedBody = `Document draft based on the work request:

Title: ${workOrder.title}

Purpose:
${workOrder.request}

Company context:
${getCompanyName()} is in the ${companyProfile.stage} stage. Main goal: ${companyProfile.mainGoal || "Not set yet"}. Current bottleneck: ${companyProfile.bottleneck || "Not set yet"}.

Draft outline:
- Situation
- What matters now
- Recommended next move
- Open questions for founder review`;
        break;
      case "Summarize signals":
        preparedBody = `Signal summary for review:

${recentSignalsText}

Summary:
The company currently has ${companySignals.length} captured signal${companySignals.length === 1 ? "" : "s"}. Review the highest-severity items first and decide which should become tasks or work orders.`;
        break;
      case "Create follow-up plan":
        preparedBody = `Follow-up plan:

Work request:
${workOrder.request}

Due: ${workOrder.dueText}

Suggested follow-up steps:
1. Confirm what outcome is needed by the due time
2. Identify blockers from recent signals or decisions
3. Prepare one concrete next action for founder approval
4. Review results before any external commitment`;
        break;
      case "Generate decision brief":
        preparedBody = `Decision brief for founder review:

Decision question:
${workOrder.request}

Why decide now:
${workOrder.sourceContext}

Relevant company context:
- Stage: ${companyProfile.stage}
- Main goal: ${companyProfile.mainGoal || "Not set yet"}
- Bottleneck: ${companyProfile.bottleneck || "Not set yet"}

Recommended decision path:
Prepare the decision, review supporting signals and prior decisions, then approve or revise before acting.`;
        break;
    }

    return `Operator Work Order Deliverable

Work request:
${workOrder.request}

Deliverable type: ${workOrder.deliverableType}
Due: ${workOrder.dueText}
Source context: ${workOrder.sourceContext}

Company context:
- Company: ${getCompanyName()}
- Stage: ${companyProfile.stage}
- Main goal: ${companyProfile.mainGoal || "Not set yet"}
- Bottleneck: ${companyProfile.bottleneck || "Not set yet"}

Recent company signals:
${recentSignalsText}

Recent decisions:
${recentDecisionsText}

Prepared output:
${preparedBody}

---
AI prepares. User approves.
This deliverable was prepared for your review only. The AI Operator will not send emails, spend money, delete data, or make commitments automatically.`;
  }

  async function prepareOperatorWorkOrder(workOrder: OperatorWorkOrder) {
    setRunningMissionId(workOrder.id);

    let preparedOutput = buildOperatorDeliverable(workOrder);

    try {
      const response = await fetch("/api/operator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workOrder,
          companyProfile,
          companyState,
          companySignals: companySignals.slice(0, 10),
          tasks: tasks.slice(0, 10),
          documents: documents.slice(0, 5),
          decisions: decisions.slice(0, 5),
        }),
      });

      const data = (await response.json()) as {
        deliverable?: string;
        error?: string;
      };

      if (!response.ok || !data.deliverable) {
        throw new Error(data.error || "AI Operator could not run this mission.");
      }

      preparedOutput = data.deliverable;
    } catch {
      preparedOutput = `${preparedOutput}\n\n---\nAI Operator API fallback:\nThe real AI Operator could not respond, so this prototype used the local mission template instead.`;
    } finally {
      setRunningMissionId(null);
    }

    setWorkOrders((currentWorkOrders) =>
      currentWorkOrders.map((order) =>
        order.id === workOrder.id
          ? {
              ...order,
              status: "Prepared",
              preparedOutput,
            }
          : order
      )
    );

    const newDocument: DocumentItem = {
      id: documents.length + 1,
      title: workOrder.title,
      type: `Operator deliverable · ${workOrder.deliverableType}`,
      content: preparedOutput,
    };

    setDocuments((currentDocuments) => [newDocument, ...currentDocuments]);
    setActiveSection("documents");
  }

  function createTaskFromOperatorDeliverable(workOrder: OperatorWorkOrder) {
    const newTask: Task = {
      id: tasks.length + 1,
      title: `Review and execute: ${workOrder.title}`,
      owner: "AI Operator",
      status: "Waiting for approval",
      source: "Operator Deliverable",
      context:
        workOrder.preparedOutput ||
        `Operator work order request: ${workOrder.request}`,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setActiveSection("tasks");
  }

  function getCompanyName() {
    return companyProfile.companyName || "Untitled Company";
  }

  async function requestAIAdvisor() {
    setIsAdvisorLoading(true);
    setAdvisorError("");

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyState,
          companySignals: companySignals.slice(0, 10),
        }),
      });

      const data = (await response.json()) as {
        advisor?: AdvisorResponse;
        error?: string;
      };

      if (!response.ok || !data.advisor) {
        throw new Error(data.error || "AI Advisor could not respond.");
      }

      setAdvisorResponse(data.advisor);
    } catch (error) {
      setAdvisorError(
        error instanceof Error
          ? error.message
          : "AI Advisor could not respond."
      );
    } finally {
      setIsAdvisorLoading(false);
    }
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

        {task.context && (
          <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Operating context
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {task.context}
            </p>
          </div>
        )}

        {task.draft && (
          <div className="mt-4 whitespace-pre-line rounded-2xl bg-[#f7f6f2] p-4 text-sm leading-6 text-neutral-600">
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
            {companyState.nodes.map((node) => (
  <div
    key={node.name}
    className={`rounded-[2rem] p-6 shadow-sm transition hover:-translate-y-0.5 ${
      getSeverityStyles(node.signalSeverity).card
    }`}
    style={getSeverityStyles(node.signalSeverity).cardStyle}
  >
    <p className="text-sm text-neutral-400">Node</p>

    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
      {node.name}
    </h2>

    {node.signalSeverity && node.signalSeverity !== "Gray" && (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            getSeverityStyles(node.signalSeverity).badge
          }`}
          style={getSeverityStyles(node.signalSeverity).badgeStyle}
        >
          {node.signalSeverity}
        </span>

        {node.signalCount ? (
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs text-neutral-500">
            {node.signalCount} signal
            {node.signalCount === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>
    )}

    <p className="mt-3 text-sm leading-6 text-neutral-600">
      {node.status}
    </p>

    <p className="mt-4 text-sm leading-6 text-neutral-500">
      Risk: {node.risk}
    </p>

    <p className="mt-4 rounded-2xl bg-[#f7f6f2] p-4 text-sm leading-6 text-neutral-500">
      Next question: {node.nextQuestion}
      <br />
      Next action: {node.nextAction}
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
      const redSignals = companySignals.filter(
        (signal) => signal.severity === "Red"
      );
      const yellowSignals = companySignals.filter(
        (signal) => signal.severity === "Yellow"
      );
      const latestSignal = companySignals[0];
      const suggestedNextNeed = latestSignal
        ? {
            title: latestSignal.recommendedAction,
            why: `Based on the latest ${latestSignal.severity.toLowerCase()} signal in ${latestSignal.node}, this may be the next thing the company needs.`,
            action: latestSignal.recommendedAction,
            severity: latestSignal.severity,
          }
        : {
            title: companyState.topPriority,
            why: "Based on the current company state, the system can suggest one next need even before external signals are connected.",
            action: companyState.topPriority,
            severity: "Gray" as const,
          };

      function createTaskFromSuggestion() {
        const newTask: Task = {
          id: tasks.length + 1,
          title: suggestedNextNeed.action,
          owner: "AI Operator",
          status: "Waiting for approval",
          source: "Predictive Assistance",
          context: suggestedNextNeed.why,
        };

        setTasks((currentTasks) => [newTask, ...currentTasks]);
        setActiveSection("tasks");
      }

      return (
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-neutral-500">Today</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
                Today&apos;s operating brief
              </h1>
            </div>

          </div>

          <div className="mt-8 grid gap-5">
            <div className="rounded-[2rem] border-2 border-neutral-300 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Save today&apos;s brief to Company Memory
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Turn this operating brief into a prepared document so it can be saved in Documents.
                  </p>
                </div>

                <button
                  onClick={saveTodayBriefAsDocument}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
                >
                  Save as Document
                </button>
              </div>
            </div>
            <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Prepare weekly operating review
                  </p>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Summarize this week&apos;s signals, tasks, documents, and decisions into one review document.
                  </p>
                </div>

                <button
                  onClick={saveWeeklyReviewAsDocument}
                  className="rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                >
                  Prepare Weekly Review
                </button>
              </div>
            </div>
            <div className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Top priority
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    {companyProfile.mainGoal ||
                      "Set a main company goal so the AI operating room can focus today&apos;s work."}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-[2rem] p-6 shadow-sm ${
                latestSignal
                  ? getSeverityStyles(latestSignal.severity).card
                  : "border border-neutral-200 bg-white/70"
              }`}
              style={
                latestSignal
                  ? getSeverityStyles(latestSignal.severity).cardStyle
                  : {}
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-950">
                    Company signal alert
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-500">
                    {latestSignal
                      ? `${latestSignal.title}: ${latestSignal.recommendedAction}`
                      : "No company signals yet. Capture a signal to make today's brief more useful."}
                  </p>
                </div>

                {latestSignal && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      getSeverityStyles(latestSignal.severity).badge
                    }`}
                    style={getSeverityStyles(latestSignal.severity).badgeStyle}
                  >
                    {latestSignal.severity}
                  </span>
                )}
              </div>

              {companySignals.length > 0 && (
                <p className="mt-4 text-xs leading-5 text-neutral-500">
                  {redSignals.length} red signal
                  {redSignals.length === 1 ? "" : "s"} · {yellowSignals.length} yellow signal
                  {yellowSignals.length === 1 ? "" : "s"}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={saveTodayBriefAsDocument}
                  className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
                >
                  Save Today Brief
                </button>

                <button
                  onClick={saveWeeklyReviewAsDocument}
                  className="rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                >
                  Prepare Weekly Review
                </button>
              </div>
            </div>

            <div
              className={`rounded-[2rem] p-6 shadow-sm ${
                suggestedNextNeed.severity !== "Gray"
                  ? getSeverityStyles(suggestedNextNeed.severity).card
                  : "border border-neutral-200 bg-white/70"
              }`}
              style={
                suggestedNextNeed.severity !== "Gray"
                  ? getSeverityStyles(suggestedNextNeed.severity).cardStyle
                  : {}
              }
            >
              <div className="mb-4 inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-neutral-500 shadow-sm">
                Predictive Assistance
              </div>

              <p className="text-sm font-semibold text-neutral-950">
                Suggested next need
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                You may need to: {suggestedNextNeed.title}
              </p>

              <div className="mt-4 rounded-2xl bg-white/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Why
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {suggestedNextNeed.why}
                </p>
              </div>

              <button
                onClick={createTaskFromSuggestion}
                className="mt-5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
              >
                Create Task from Suggestion
              </button>
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
          <p className="text-sm text-neutral-500">Intelligence Inbox</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Company signals
          </h1>

          <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Quick Capture
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Paste an email, customer feedback, deadline, tool alert, idea, or
              company problem. AI Company Run will turn it into a company signal.
            </p>

            <textarea
              value={quickCaptureInput}
              onChange={(event) => setQuickCaptureInput(event.target.value)}
              placeholder="Example: Vercel sent a Build Failed email after my latest deployment."
              className="mt-5 min-h-32 w-full resize-none rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 text-sm leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />

            <button
              onClick={analyzeQuickCapture}
              className="mt-4 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Analyze Signal
            </button>
          </div>

          <div className="mt-8 space-y-3">
            {companySignals.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-neutral-200 bg-white/50 p-6 text-sm leading-6 text-neutral-500">
                No company signals yet. Use Quick Capture to turn a messy input
                into a clear operating signal.
              </div>
            ) : (
              companySignals.map((signal) => (
                <div
                  key={signal.id}
                  className={`rounded-[2rem] p-6 shadow-sm ${
                    getSeverityStyles(signal.severity).card
                  }`}
                  style={getSeverityStyles(signal.severity).cardStyle}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">
                        {signal.source} · {signal.type}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        {signal.title}
                      </h2>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="rounded-full bg-[#f7f6f2] px-3 py-1 text-xs text-neutral-500">
                        {signal.node}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          getSeverityStyles(signal.severity).badge
                        }`}
                        style={getSeverityStyles(signal.severity).badgeStyle}
                      >
                        {signal.severity}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-neutral-500">
                    {signal.summary}
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Why it matters
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {signal.whyItMatters}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Recommended action
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {signal.recommendedAction}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => createTaskFromSignal(signal)}
                      className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 transition hover:bg-white"
                    >
                      Create Task from Signal
                    </button>

                    <button
                      onClick={() => assignSignalToOperator(signal)}
                      className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                    >
                      Assign to Operator
                    </button>

                    <button
                      onClick={() => ignoreSignal(signal.id)}
                      className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-500 transition hover:bg-white"
                    >
                      Ignore Signal
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    if (activeSection === "operator") {
      return (
        <div>
          <p className="text-sm text-neutral-500">AI Operator</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
            Mission Control
          </h1>

          <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="inline-flex rounded-full bg-[#f7f6f2] px-3 py-1 text-xs font-medium text-neutral-500">
                  AI Employee · Ready for assignment
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                  Assign missions to your AI Operator and turn outside signals
                  into reviewable company work.
                </h2>
                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  Think of this as mission control for your one-person company.
                  You can assign internal missions, research missions, and
                  execution prep missions. The operator prepares the work, but
                  never takes external action alone.
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f6f2] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Operating rules
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Can prepare: research briefs, pain point hunts, launch ideas,
                  plans, drafts, task lists, and decision briefs.
                </p>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Cannot do alone: send emails, spend money, delete data, or
                  commit to customers.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Assign a mission to your AI Operator
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Choose a mission type, describe what the operator should investigate
              or prepare, then review the output before turning it into a task,
              document, or decision.
            </p>

            <div className="mt-5 rounded-2xl bg-[#f7f6f2] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Mission templates
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  {
                    label: "Research competitors",
                    request:
                      "Research competitors in the AI operating system / AI productivity market and prepare a short competitor brief.",
                    deliverableType: "Research market signals" as DeliverableType,
                    dueText: "Today",
                    sourceContext:
                      "AI operating systems, solo founder tools, productivity software, and startup operating platforms",
                  },
                  {
                    label: "Find customer pain points",
                    request:
                      "Find customer pain points for solo founders who struggle with scattered company tasks, emails, signals, and decisions.",
                    deliverableType: "Find customer pain points" as DeliverableType,
                    dueText: "Today",
                    sourceContext:
                      "Solo founders, indie hackers, freelancers, one-person companies, and early startup operators",
                  },
                  {
                    label: "Prepare launch ideas",
                    request:
                      "Prepare launch ideas for AI Company Run and suggest clear positioning angles.",
                    deliverableType: "Prepare launch ideas" as DeliverableType,
                    dueText: "This week",
                    sourceContext:
                      "AI Company Run, founder operating system, AI prepares and user approves",
                  },
                  {
                    label: "Summarize internal signals",
                    request:
                      "Summarize the recent company signals and identify what should become tasks, decisions, or operator missions.",
                    deliverableType: "Summarize internal signals" as DeliverableType,
                    dueText: "Today",
                    sourceContext:
                      "Recent company signals, company room node status, tasks, and decisions",
                  },
                  {
                    label: "Prepare execution plan",
                    request:
                      "Prepare an execution plan for the next visible product improvement.",
                    deliverableType: "Prepare execution plan" as DeliverableType,
                    dueText: "Tomorrow morning",
                    sourceContext:
                      "Current product state, active bottleneck, pending tasks, and founder goal",
                  },
                ].map((template) => (
                  <button
                    key={template.label}
                    onClick={() => applyMissionTemplate(template)}
                    className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={workOrderRequest}
              onChange={(event) => setWorkOrderRequest(event.target.value)}
              placeholder="Example: Research the market for AI operating systems for solo founders and find 5 customer pain points."
              className="mt-5 min-h-32 w-full resize-none rounded-[1.5rem] border border-neutral-200 bg-white px-4 py-4 text-sm leading-6 text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Mission type
                </label>
                <select
                  value={workOrderDeliverableType}
                  onChange={(event) =>
                    setWorkOrderDeliverableType(
                      event.target.value as DeliverableType
                    )
                  }
                  className="mt-2 w-full rounded-[1.25rem] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition focus:border-neutral-400"
                >
                  <option value="Research market signals">
                    Research market signals
                  </option>
                  <option value="Find customer pain points">
                    Find customer pain points
                  </option>
                  <option value="Prepare launch ideas">
                    Prepare launch ideas
                  </option>
                  <option value="Summarize internal signals">
                    Summarize internal signals
                  </option>
                  <option value="Prepare execution plan">
                    Prepare execution plan
                  </option>
                  <option value="Generate decision brief">
                    Generate decision brief
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Mission due time
                </label>
                <input
                  value={workOrderDueText}
                  onChange={(event) => setWorkOrderDueText(event.target.value)}
                  placeholder="Tomorrow morning"
                  className="mt-2 w-full rounded-[1.25rem] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Mission context
                </label>
                <input
                  value={workOrderSourceContext}
                  onChange={(event) =>
                    setWorkOrderSourceContext(event.target.value)
                  }
                  placeholder="Example: Solo founders, indie hackers, AI productivity market"
                  className="mt-2 w-full rounded-[1.25rem] border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
                />
              </div>
            </div>

            <button
              onClick={createOperatorWorkOrder}
              className="mt-4 rounded-full bg-neutral-950 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
            >
              Assign Mission
            </button>
          </div>

          <div className="mt-8 space-y-3">
            {workOrders.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-neutral-200 bg-white/50 p-6 text-sm leading-6 text-neutral-500">
                No missions yet. Assign a mission to the AI Operator and it will
                prepare a reviewable deliverable for your company.
              </div>
            ) : (
              workOrders.map((workOrder) => (
                <div
                  key={workOrder.id}
                  className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-neutral-400">
                        Mission · {workOrder.deliverableType} · Due {workOrder.dueText}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                        {workOrder.title}
                      </h2>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        workOrder.status === "Prepared"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {workOrder.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-neutral-600">
                    {workOrder.request}
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Employee-style work brief
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      I will run this mission by {workOrder.dueText}. I will use
                      {workOrder.sourceContext} as context. I will stop at a
                      reviewable deliverable and wait for founder approval.
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Source context
                    </p>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {workOrder.sourceContext}
                    </p>
                  </div>

                  {workOrder.preparedOutput && (
                    <div className="mt-4 rounded-2xl bg-[#f7f6f2] p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                        Prepared output
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                        {workOrder.preparedOutput}
                      </p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3">
                    {workOrder.status === "Assigned" && (
                      <button
                        onClick={() => prepareOperatorWorkOrder(workOrder)}
                        disabled={runningMissionId === workOrder.id}
                        className="rounded-full bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                      >
                        {runningMissionId === workOrder.id
                          ? "Operator is running..."
                          : "Operator: Run Mission"}
                      </button>
                    )}

                    {workOrder.preparedOutput && (
                      <button
                        onClick={() => createTaskFromOperatorDeliverable(workOrder)}
                        className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Create Task from Deliverable
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
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
              documents.map((document, documentIndex) => (
                <div
                  key={`${document.id}-${document.type}-${documentIndex}`}
                  className="rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm"
                >
                  <p className="text-sm text-neutral-400">{document.type}</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                    {document.title}
                  </h2>
                  <p className="mt-4 text-sm leading-6 text-neutral-600">
                    {document.content}
                  </p>

                  <button
                    onClick={() => approveDocumentAsDecision(document)}
                    className="mt-5 rounded-full bg-neutral-950 px-4 py-2 text-xs font-medium text-white transition hover:bg-neutral-800"
                  >
                    Approve as Decision
                  </button>
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
                    {advisorResponse
                      ? advisorResponse.whatHappened
                      : "Your company room is active. The system now separates tasks, documents, decisions, signals, and trust controls."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">
                    Why it matters?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {advisorResponse
                      ? advisorResponse.whyItMatters
                      : "A one-person company needs a shared operating context, not scattered notes and endless chat."}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-950">
                    What should you do next?
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">
                    {advisorResponse
                      ? advisorResponse.whatToDoNext
                      : getAdvisorNextStep()}
                  </p>
                </div>

                {advisorError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-600">
                    {advisorError}
                  </div>
                )}

                <button
                  onClick={requestAIAdvisor}
                  disabled={isAdvisorLoading}
                  className="w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
                >
                  {isAdvisorLoading ? "AI Advisor preparing..." : "Ask AI Advisor"}
                </button>

                {advisorResponse && (
                  <div className="rounded-[1.75rem] border border-neutral-200 bg-[#f7f6f2] p-5">
                    <div className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-500 shadow-sm">
                      Prepared Action
                    </div>

                    <p className="text-sm font-semibold leading-6 text-neutral-950">
                      {advisorResponse.whatToDoNext}
                    </p>

                    <p className="mt-3 text-xs leading-5 text-neutral-500">
                      The AI Advisor prepared this as the next operating action.
                      You can approve it into your task system.
                    </p>

                    <div className="mt-5 flex flex-col gap-2">
                      <button
                        onClick={createTaskFromAdvisorAdvice}
                        className="w-full rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-neutral-800"
                      >
                        Approve as Task
                      </button>

                      <button
                        onClick={assignAdvisorAdviceToOperator}
                        className="w-full rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50"
                      >
                        Assign to Operator
                      </button>

                      <button
                        onClick={() => setAdvisorResponse(null)}
                        className="w-full rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600 shadow-sm transition hover:bg-neutral-50"
                      >
                        Skip for now
                      </button>
                    </div>
                  </div>
                )}
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
