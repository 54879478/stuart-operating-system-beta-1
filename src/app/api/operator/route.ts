import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildOperatorPrompt } from "@/lib/operatorPrompt";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OpenAI API key." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      workOrder?: {
        title: string;
        request: string;
        deliverableType: string;
        dueText: string;
        sourceContext: string;
      };
      companyProfile?: {
        companyName: string;
        description: string;
        stage: string;
        mainGoal: string;
        bottleneck: string;
      };
      companyState?: unknown;
      companySignals?: unknown[];
      tasks?: unknown[];
      documents?: unknown[];
      decisions?: unknown[];
    };

    if (!body.workOrder || !body.companyProfile) {
      return NextResponse.json(
        { error: "Missing workOrder or companyProfile." },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = buildOperatorPrompt({
      workOrder: body.workOrder,
      companyProfile: body.companyProfile,
      companyState: body.companyState ?? {},
      companySignals: body.companySignals ?? [],
      tasks: body.tasks ?? [],
      documents: body.documents ?? [],
      decisions: body.decisions ?? [],
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const deliverable = response.output_text;

    if (!deliverable) {
      return NextResponse.json(
        { error: "The AI Operator did not return a deliverable." },
        { status: 500 }
      );
    }

    return NextResponse.json({ deliverable });
  } catch (error) {
    console.error("Operator API error:", error);

    return NextResponse.json(
      { error: "The AI Operator could not prepare a deliverable." },
      { status: 500 }
    );
  }
}
