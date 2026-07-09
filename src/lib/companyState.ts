import type { CompanySignal, CompanyNodeName } from "./companySignal";

export type CompanyProfile = {
  companyName: string;
  description: string;
  stage: string;
  mainGoal: string;
  bottleneck: string;
};

export type CompanyNodeState = {
  name: CompanyNodeName;
  status: string;
  risk: string;
  nextQuestion: string;
  nextAction: string;
  signalSeverity?: "Green" | "Yellow" | "Red" | "Gray";
  signalCount?: number;
  latestSignalTitle?: string;
};

export type CompanyState = {
  summary: string;
  topPriority: string;
  mainRisk: string;
  nodes: CompanyNodeState[];
};

type TaskLike = {
  status: string;
};

type DocumentLike = {
  title: string;
};

type DecisionLike = {
  title: string;
};

export function generateCompanyState(
  companyProfile: CompanyProfile,
  tasks: TaskLike[],
  documents: DocumentLike[],
  decisions: DecisionLike[],
  signals: CompanySignal[] = []
): CompanyState {
  const hasTasks = tasks.length > 0;
  const hasDocuments = documents.length > 0;
  const hasDecisions = decisions.length > 0;

  function getSignalsForNode(nodeName: CompanyNodeName) {
    return signals.filter((signal) => signal.node === nodeName);
  }

  function getHighestSeverity(nodeSignals: CompanySignal[]) {
    if (nodeSignals.some((signal) => signal.severity === "Red")) {
      return "Red" as const;
    }

    if (nodeSignals.some((signal) => signal.severity === "Yellow")) {
      return "Yellow" as const;
    }

    if (nodeSignals.some((signal) => signal.severity === "Green")) {
      return "Green" as const;
    }

    return "Gray" as const;
  }

  function applySignalContext(
    nodeName: CompanyNodeName,
    baseStatus: string,
    baseRisk: string,
    baseNextAction: string
  ) {
    const nodeSignals = getSignalsForNode(nodeName);
    const latestSignal = nodeSignals[0];

    if (!latestSignal) {
      return {
        status: baseStatus,
        risk: baseRisk,
        nextAction: baseNextAction,
        signalSeverity: "Gray" as const,
        signalCount: 0,
        latestSignalTitle: undefined,
      };
    }

    return {
      status: `${nodeName} has ${nodeSignals.length} active company signal${
        nodeSignals.length === 1 ? "" : "s"
      }. Latest: ${latestSignal.title}`,
      risk: latestSignal.whyItMatters,
      nextAction: latestSignal.recommendedAction,
      signalSeverity: getHighestSeverity(nodeSignals),
      signalCount: nodeSignals.length,
      latestSignalTitle: latestSignal.title,
    };
  }

  const productSignalContext = applySignalContext(
    "Product",
    companyProfile.stage === "Idea"
      ? "The product is still in the idea stage."
      : `The product is currently in the ${companyProfile.stage} stage.`,
    "The product promise may still be too broad.",
    "Write one clear product promise."
  );

  const customersSignalContext = applySignalContext(
    "Customers",
    hasDocuments
      ? "A customer-related draft exists."
      : "The first customer segment is not clearly documented yet.",
    "The target user may be too general.",
    "Define the first customer segment."
  );

  const marketSignalContext = applySignalContext(
    "Market",
    "The market category is not mapped yet.",
    "The product may sound too similar to existing tools.",
    "List 3 existing alternatives."
  );

  const operationsSignalContext = applySignalContext(
    "Operations",
    companyProfile.bottleneck
      ? companyProfile.bottleneck
      : "No operating bottleneck has been recorded yet.",
    "Execution may stall if the bottleneck stays unclear.",
    "Turn the bottleneck into one operating task."
  );

  const financeSignalContext = applySignalContext(
    "Finance",
    "The revenue model is not defined in this prototype yet.",
    "The company may lack a clear path to monetization.",
    "Write a simple pricing hypothesis."
  );

  const documentsSignalContext = applySignalContext(
    "Documents",
    `${documents.length} prepared document${
      documents.length === 1 ? "" : "s"
    } and ${decisions.length} approved decision${
      decisions.length === 1 ? "" : "s"
    }.`,
    hasTasks && !hasDecisions
      ? "Tasks exist, but few decisions have been approved."
      : "Company memory is still early.",
    "Prepare one operating memo."
  );

  return {
    summary:
      companyProfile.description ||
      "This company has not been clearly described yet.",

    topPriority:
      companyProfile.mainGoal ||
      "Define the main company goal before creating more operating tasks.",

    mainRisk:
      companyProfile.bottleneck ||
      "The biggest company bottleneck has not been declared yet.",

    nodes: [
      {
        name: "Product",
        status: productSignalContext.status,
        risk: productSignalContext.risk,
        nextQuestion: "What is the first painful use case this product solves?",
        nextAction: productSignalContext.nextAction,
        signalSeverity: productSignalContext.signalSeverity,
        signalCount: productSignalContext.signalCount,
        latestSignalTitle: productSignalContext.latestSignalTitle,
      },
      {
        name: "Customers",
        status: customersSignalContext.status,
        risk: customersSignalContext.risk,
        nextQuestion: "Who feels this problem every day?",
        nextAction: customersSignalContext.nextAction,
        signalSeverity: customersSignalContext.signalSeverity,
        signalCount: customersSignalContext.signalCount,
        latestSignalTitle: customersSignalContext.latestSignalTitle,
      },
      {
        name: "Market",
        status: marketSignalContext.status,
        risk: marketSignalContext.risk,
        nextQuestion: "What tool or workflow does this replace?",
        nextAction: marketSignalContext.nextAction,
        signalSeverity: marketSignalContext.signalSeverity,
        signalCount: marketSignalContext.signalCount,
        latestSignalTitle: marketSignalContext.latestSignalTitle,
      },
      {
        name: "Operations",
        status: operationsSignalContext.status,
        risk: operationsSignalContext.risk,
        nextQuestion: "What is slowing the founder down right now?",
        nextAction: operationsSignalContext.nextAction,
        signalSeverity: operationsSignalContext.signalSeverity,
        signalCount: operationsSignalContext.signalCount,
        latestSignalTitle: operationsSignalContext.latestSignalTitle,
      },
      {
        name: "Finance",
        status: financeSignalContext.status,
        risk: financeSignalContext.risk,
        nextQuestion: "Who would pay for this and why now?",
        nextAction: financeSignalContext.nextAction,
        signalSeverity: financeSignalContext.signalSeverity,
        signalCount: financeSignalContext.signalCount,
        latestSignalTitle: financeSignalContext.latestSignalTitle,
      },
      {
        name: "Documents",
        status: documentsSignalContext.status,
        risk: documentsSignalContext.risk,
        nextQuestion: "What document would make the next decision easier?",
        nextAction: documentsSignalContext.nextAction,
        signalSeverity: documentsSignalContext.signalSeverity,
        signalCount: documentsSignalContext.signalCount,
        latestSignalTitle: documentsSignalContext.latestSignalTitle,
      },
    ],
  };
}
