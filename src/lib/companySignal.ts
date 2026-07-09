export type SignalSource =
  | "Quick Capture"
  | "Gmail"
  | "System"
  | "Manual";

export type SignalType =
  | "Customer feedback"
  | "Deadline"
  | "Follow-up"
  | "Opportunity"
  | "Invoice / payment issue"
  | "Tool notification"
  | "Partnership message"
  | "Product idea"
  | "Company problem";

export type SignalSeverity = "Green" | "Yellow" | "Red" | "Gray";

export type CompanyNodeName =
  | "Product"
  | "Customers"
  | "Market"
  | "Operations"
  | "Finance"
  | "Documents";

export type CompanySignal = {
  id: number;
  title: string;
  source: SignalSource;
  type: SignalType;
  node: CompanyNodeName;
  severity: SignalSeverity;
  summary: string;
  whyItMatters: string;
  recommendedAction: string;
  createdAt: string;
};

export function createQuickCaptureSignal(input: string, nextId: number): CompanySignal {
  const lowerInput = input.toLowerCase();

  let type: SignalType = "Company problem";
  let node: CompanyNodeName = "Operations";
  let severity: SignalSeverity = "Yellow";
  let title = "New company signal captured";
  let recommendedAction = "Review this signal and decide the next operating action.";

  if (
    lowerInput.includes("gmail") ||
    lowerInput.includes("email") ||
    lowerInput.includes("customer") ||
    lowerInput.includes("user")
  ) {
    type = "Customer feedback";
    node = "Customers";
    severity = "Yellow";
    title = "Customer or user signal detected";
    recommendedAction =
      "Clarify what this signal says about the first customer group or product requirement.";
  }

  if (
    lowerInput.includes("deadline") ||
    lowerInput.includes("due") ||
    lowerInput.includes("tomorrow") ||
    lowerInput.includes("urgent")
  ) {
    type = "Deadline";
    node = "Operations";
    severity = "Red";
    title = "Deadline or urgent operation signal detected";
    recommendedAction =
      "Create a task for this deadline and decide what must be done first.";
  }

  if (
    lowerInput.includes("invoice") ||
    lowerInput.includes("payment") ||
    lowerInput.includes("bill") ||
    lowerInput.includes("money")
  ) {
    type = "Invoice / payment issue";
    node = "Finance";
    severity = "Red";
    title = "Finance signal detected";
    recommendedAction =
      "Create a finance task and confirm the payment, invoice, or cost issue.";
  }

  if (
    lowerInput.includes("vercel") ||
    lowerInput.includes("build failed") ||
    lowerInput.includes("deployment") ||
    lowerInput.includes("error")
  ) {
    type = "Tool notification";
    node = "Operations";
    severity = "Red";
    title = "Tool or deployment issue detected";
    recommendedAction =
      "Fix the deployment or tool issue before continuing new product work.";
  }

  if (
    lowerInput.includes("opportunity") ||
    lowerInput.includes("partner") ||
    lowerInput.includes("collab") ||
    lowerInput.includes("collaboration")
  ) {
    type = "Opportunity";
    node = "Market";
    severity = "Green";
    title = "Market opportunity detected";
    recommendedAction =
      "Review the opportunity and decide whether it should become a follow-up task.";
  }

  return {
    id: nextId,
    title,
    source: "Quick Capture",
    type,
    node,
    severity,
    summary: input,
    whyItMatters:
      "This signal may affect the company state and should be turned into a clear next action instead of staying scattered.",
    recommendedAction,
    createdAt: new Date().toISOString(),
  };
}
