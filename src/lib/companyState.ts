export type CompanyProfile = {
  companyName: string;
  description: string;
  stage: string;
  mainGoal: string;
  bottleneck: string;
};

export type CompanyNodeState = {
  name: string;
  status: string;
  risk: string;
  nextQuestion: string;
  nextAction: string;
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
  decisions: DecisionLike[]
): CompanyState {
  const hasTasks = tasks.length > 0;
  const hasDocuments = documents.length > 0;
  const hasDecisions = decisions.length > 0;

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
        status:
          companyProfile.stage === "Idea"
            ? "The product is still in the idea stage."
            : `The product is currently in the ${companyProfile.stage} stage.`,
        risk: "The product promise may still be too broad.",
        nextQuestion: "What is the first painful use case this product solves?",
        nextAction: "Write one clear product promise.",
      },
      {
        name: "Customers",
        status: hasDocuments
          ? "A customer-related draft exists."
          : "The first customer segment is not clearly documented yet.",
        risk: "The target user may be too general.",
        nextQuestion: "Who feels this problem every day?",
        nextAction: "Define the first customer segment.",
      },
      {
        name: "Market",
        status: "The market category is not mapped yet.",
        risk: "The product may sound too similar to existing tools.",
        nextQuestion: "What tool or workflow does this replace?",
        nextAction: "List 3 existing alternatives.",
      },
      {
        name: "Operations",
        status: companyProfile.bottleneck
          ? companyProfile.bottleneck
          : "No operating bottleneck has been recorded yet.",
        risk: "Execution may stall if the bottleneck stays unclear.",
        nextQuestion: "What is slowing the founder down right now?",
        nextAction: "Turn the bottleneck into one operating task.",
      },
      {
        name: "Finance",
        status: "The revenue model is not defined in this prototype yet.",
        risk: "The company may lack a clear path to monetization.",
        nextQuestion: "Who would pay for this and why now?",
        nextAction: "Write a simple pricing hypothesis.",
      },
      {
        name: "Documents",
        status: `${documents.length} prepared document${
          documents.length === 1 ? "" : "s"
        } and ${decisions.length} approved decision${
          decisions.length === 1 ? "" : "s"
        }.`,
        risk:
          hasTasks && !hasDecisions
            ? "Tasks exist, but few decisions have been approved."
            : "Company memory is still early.",
        nextQuestion: "What document would make the next decision easier?",
        nextAction: "Prepare one operating memo.",
      },
    ],
  };
}
