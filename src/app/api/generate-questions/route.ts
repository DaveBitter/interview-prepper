import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// This application now relies entirely on Gemini AI to generate contextual,
// personalized interview questions based on the specific resume and job posting provided.

export async function POST(request: NextRequest) {
  try {
    const { resume, jobDescription } = await request.json();

    if (!resume || !jobDescription) {
      return NextResponse.json(
        { error: "Resume and job description are required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Gemini API key is required to generate contextual interview questions. Please configure your API key in the environment variables.",
        },
        { status: 400 }
      );
    }

    // Initialize the new Google GenAI client
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Use the known working model names from official documentation
    console.log("Using known working models from official documentation");
    const modelNames = [
      "gemini-2.0-flash-001",
      "gemini-1.5-flash-001",
      "gemini-1.5-pro-001",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ];

    const prompt = `
Generate 6-8 interview questions based on the exact resume and job posting content below.

RESUME:
${resume}

JOB POSTING:
${jobDescription}

STRICT RULES - FOLLOW EXACTLY:
1. ONLY reference company names, projects, and details that appear EXACTLY in the resume text above
2. NEVER use placeholder names like "ABC Company", "XYZ Corp", "TechCorp", or any made-up company names
3. If a technology is mentioned in both documents, reference the EXACT context from the resume
4. If you cannot find specific details in the resume, ask more general behavioral questions instead
5. Do NOT invent or assume any information not explicitly written in the provided documents

Read the resume carefully and identify:
- The actual company names mentioned
- The real project names or descriptions
- The specific technologies and skills listed
- The actual job title and experience details

Then create questions that connect these REAL details from the resume to the ACTUAL requirements in the job posting.

LANGUAGE STYLE:
- Sound like a natural, conversational interviewer
- Avoid formal phrases like "the posting," "the role requires," "this position"
- Use natural language: "I see you worked with..." "I noticed..." "Given that we're looking for..."
- Be specific and personal, referencing their actual experience

Return ONLY valid JSON:
[
  {
    "category": "Technical",
    "question": "I see you have experience with [ACTUAL technology] at [ACTUAL company]. Can you walk me through how you'd apply that experience to [ACTUAL challenge/requirement]?",
    "tips": "Reference your specific experience with [ACTUAL details from resume]",
    "suggestedAnswer": "Use the STAR method to describe your actual experience with [REAL technology/project from resume]"
  }
]

REMEMBER: Use ONLY real information from the documents. Sound conversational and natural.
`;

    let text;
    let successfulModel = null;

    // Try each model until one works with the new SDK
    for (const tryModelName of modelNames) {
      try {
        console.log(`Trying model: ${tryModelName}`);

        // Use the correct SDK syntax from official docs
        const response = await ai.models.generateContent({
          model: tryModelName,
          contents: prompt,
        });

        text = response.text;
        successfulModel = tryModelName;
        console.log(
          `Successfully generated content with model: ${tryModelName}`
        );
        break;
      } catch (modelError) {
        const errorMessage =
          modelError instanceof Error ? modelError.message : "Unknown error";
        console.log(`Model ${tryModelName} failed:`, errorMessage);

        // If this is the last model to try, return the error
        if (tryModelName === modelNames[modelNames.length - 1]) {
          console.error("All Gemini models failed. Last error:", modelError);
          return NextResponse.json(
            {
              error:
                "Failed to generate AI-powered interview questions. All available models failed. This could be due to API rate limits, network issues, or invalid API key.",
              details: `Tried models: ${modelNames.join(
                ", "
              )}. Last error: ${errorMessage}`,
            },
            { status: 503 }
          );
        }
        // Continue to next model
        continue;
      }
    }

    // Check if we got a response
    if (!text) {
      return NextResponse.json(
        {
          error: "No response received from AI models.",
          details: "All models failed to generate content.",
        },
        { status: 503 }
      );
    }

    // Parse the JSON response
    let questions;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }

      // Validate that we got proper questions
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid questions format received");
      }

      // Validate question structure
      for (const q of questions) {
        if (!q.category || !q.question || !q.tips) {
          throw new Error("Invalid question structure");
        }
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response:", text);

      return NextResponse.json(
        {
          error:
            "Failed to parse AI response. The AI may have returned an unexpected format. Please try again.",
          details:
            parseError instanceof Error ? parseError.message : "Parse error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions,
      note: `These questions were generated by AI (${successfulModel}) specifically for your resume and this job posting.`,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
