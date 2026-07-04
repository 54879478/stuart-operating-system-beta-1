import OpenAI from "openai";
import {
  buildAdvisorSystemPrompt,
  buildAdvisorUserPrompt,
  getFallbackAdvisorResponse,
  type AdvisorResponse,
} from "@/lib/advisorPrompt";
import type { CompanyState } from "@/lib/companyState";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeParseAdvisorResponse(text: string): AdvisorResponse | null {
  try {
    const parsed = JSON.parse(text) as AdvisorResponse;

    if (
      typeof parsed.whatHappened === "string" &&
      typeof parsed.whyItMatters === "string" &&
      typeof parsed.whatToDoNext === "string"
    ) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      companyState?: CompanyState;
    };

    if (!body.companyState) {
      return Response.json(
        { error: "Missing companyState." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: buildAdvisorSystemPrompt(),
        },
        {
          role: "user",
          content: buildAdvisorUserPrompt(body.companyState),
        },
      ],
    });

    const text = response.output_text;
    const parsed = safeParseAdvisorResponse(text);

    if (!parsed) {
      return Response.json({
        advisor: getFallbackAdvisorResponse(body.companyState),
        usedFallback: true,
      });
    }

    return Response.json({
      advisor: parsed,
      usedFallback: false,
    });
  } catch (error) {
    console.error("Advisor API error:", error);

    return Response.json(
      {
        error: "The AI Advisor could not generate a response.",
      },
      { status: 500 }
    );
  }
}
