"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BrainCircuit,
  Upload,
  FileText,
  Sparkles,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  category: string;
  question: string;
  tips: string;
  suggestedAnswer?: string;
}

export default function GeneratePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);

    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
    } else {
      // For demo purposes, show placeholder text for non-text files
      setResumeText(
        `[Uploaded file: ${file.name}]\n\nPlease paste your resume content here or upload a text file.`
      );
    }
  };

  const generateQuestions = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      alert("Please provide both your resume and job description");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: resumeText,
          jobDescription: jobDescription,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();

      if (data.error) {
        alert(
          `Error: ${data.error}${
            data.details ? "\n\nDetails: " + data.details : ""
          }`
        );
        return;
      }

      const generatedQuestions = data.questions || [];
      setQuestions(generatedQuestions);
      setNote(data.note || "");

      // Automatically redirect to practice mode
      if (generatedQuestions.length > 0) {
        const questionsParam = encodeURIComponent(
          JSON.stringify(generatedQuestions)
        );
        router.push(`/practice?questions=${questionsParam}`);
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">
                Interview Prepper
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">
              AI-Powered Interview Questions
            </h1>
            <p className="text-lg text-muted-foreground">
              Get personalized interview questions tailored specifically to your
              resume and the job you&apos;re applying for
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                Powered by AI
              </div>
              <p className="text-blue-800 text-sm">
                Our AI analyzes both your resume and the job posting to generate
                contextual questions that reference your specific experience,
                projects, and the role&apos;s requirements - just like a real
                interviewer would.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Resume Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Your Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume file or paste the content below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {resumeFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Uploaded: {resumeFile.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Or paste your resume content:
                  </label>
                  <Textarea
                    placeholder="Paste your resume content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Description
                </CardTitle>
                <CardDescription>
                  Paste the complete job posting you&apos;re applying for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the complete job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[280px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <Button
              onClick={generateQuestions}
              disabled={
                isLoading || !resumeText.trim() || !jobDescription.trim()
              }
              size="lg"
              className="text-lg px-8 py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions & Starting Practice...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Interview Questions
                </>
              )}
            </Button>
          </div>

          {/* Generated Questions */}
          {questions.length > 0 && (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold">
                  Your Personalized Questions
                </h2>
                <p className="text-muted-foreground">
                  Practice these questions to prepare for your interview
                </p>
                {note && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 max-w-2xl mx-auto">
                    💡 {note}
                  </div>
                )}
              </div>

              <div className="grid gap-6">
                {questions.map((q, index) => (
                  <Card key={index} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                          {q.category}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Question {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{q.question}</h3>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm">
                          <strong>💡 Tip:</strong> {q.tips}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center space-y-4">
                <Link
                  href={`/practice?questions=${encodeURIComponent(
                    JSON.stringify(questions)
                  )}`}
                  className="inline-block"
                >
                  <Button size="lg" className="text-lg px-8 py-6">
                    <BrainCircuit className="mr-2 h-5 w-5" />
                    Start Interview Practice
                  </Button>
                </Link>

                <div>
                  <Button
                    onClick={() => {
                      setQuestions([]);
                      setResumeText("");
                      setJobDescription("");
                      setResumeFile(null);
                      setNote("");
                    }}
                    variant="outline"
                  >
                    Generate New Questions
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
