import type { CompanySignal } from "./companySignal";
import type { CompanyState } from "./companyState";

export type AdvisorResponse = {
  whatHappened: string;
  whyItMatters: string;
  whatToDoNext: string;
};

export function buildAdvisorSystemPrompt() {
  return `
You are the Operating Advisor inside AI Company Run.

AI Company Run is not a chatbot, not Notion, and not a project manager.
It is an AI operating system for one-person companies.

Your role:
- Act like a calm operating partner for a solo founder.
- Diagnose the company state.
- Identify the real bottleneck.
- Explain why it matters.
- Tell the user the next concrete action.

Voice:
- Calm.
- Direct.
- Natural.
- Not overly motivational.
- Not corporate.
- Not cute.
- Not generic.
- Not like a consultant slide deck.
- Not like a productivity app.
- Not like normal ChatGPT.

Rules:
- Do not overpraise the user.
- Do not say "Great job" unless there is a concrete reason.
- Do not give too many options.
- Do not sound creepy or over-personal.
- Do not pretend to know private life context.
- Do not mention Gmail, inbox, or private data unless the user connected it.
- Be proactive, but always explain why.
- AI prepares. User approves.
- When recent company signals are provided, read them carefully.
- Red severity signals are urgent operating issues and should outrank new feature work.
- If a Red Operations or tool signal exists (for example a failed deployment or build), say so clearly and recommend fixing it before continuing product work.

Output format:
Return only valid JSON with these exact keys:
{
  "whatHappened": "...",
  "whyItMatters": "...",
  "whatToDoNext": "..."
}

Each value should be 1-3 short sentences.
`;
}

function formatRecentSignals(signals: CompanySignal[]) {
  if (signals.length === 0) {
    return "No recent company signals captured.";
  }

  return signals
    .map(
      (signal) => `
- ${signal.title}
  Severity: ${signal.severity}
  Node: ${signal.node}
  Type: ${signal.type}
  Source: ${signal.source}
  Summary: ${signal.summary}
  Why it matters: ${signal.whyItMatters}
  Recommended action: ${signal.recommendedAction}
  Captured: ${signal.createdAt}`
    )
    .join("\n");
}

export function buildAdvisorUserPrompt(
  companyState: CompanyState,
  companySignals: CompanySignal[] = []
) {
  return `
Analyze this company state and produce an Operating Advisor response.

Company summary:
${companyState.summary}

Top priority:
${companyState.topPriority}

Main risk:
${companyState.mainRisk}

Recent company signals (newest first):
${formatRecentSignals(companySignals)}

Company nodes:
${companyState.nodes
  .map(
    (node) => `
- ${node.name}
  Status: ${node.status}
  Risk: ${node.risk}
  Signal severity: ${node.signalSeverity ?? "Gray"}
  Active signals: ${node.signalCount ?? 0}
  Latest signal: ${node.latestSignalTitle ?? "None"}
  Next question: ${node.nextQuestion}
  Next action: ${node.nextAction}`
  )
  .join("\n")}

Respond as the Operating Advisor.
Focus on the most important bottleneck.
If a recent Red signal exists, especially in Operations, address it directly.
Do not list everything.
Tell the founder what to do next.
`;
}

export function getFallbackAdvisorResponse(
  companyState: CompanyState,
  companySignals: CompanySignal[] = []
): AdvisorResponse {
  const urgentSignal = companySignals.find((signal) => signal.severity === "Red");

  if (urgentSignal) {
    return {
      whatHappened: `A red ${urgentSignal.node.toLowerCase()} signal was detected: ${urgentSignal.title}.`,
      whyItMatters:
        urgentSignal.whyItMatters ||
        "Urgent operating issues can block product progress until they are resolved.",
      whatToDoNext:
        urgentSignal.recommendedAction ||
        "Fix this urgent signal before starting new feature work.",
    };
  }

  return {
    whatHappened:
      "Your company room has enough structure to show the first operating pattern.",
    whyItMatters:
      companyState.mainRisk ||
      "A one-person company can lose momentum when the main bottleneck is not visible.",
    whatToDoNext:
      companyState.topPriority ||
      "Define one concrete company goal before creating more tasks.",
  };
}
