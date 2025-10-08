"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BrainCircuit,
  ArrowLeft,
  ArrowRight,
  SkipForward,
  Lightbulb,
  Eye,
  EyeOff,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Question {
  category: string;
  question: string;
  tips: string;
  suggestedAnswer?: string;
}

export default function PracticePage() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const questionsData = searchParams.get("questions");
    if (questionsData) {
      try {
        const parsedQuestions = JSON.parse(decodeURIComponent(questionsData));
        setQuestions(parsedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing questions:", error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowTips(false);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowTips(false);
      setShowAnswer(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const markAsCompleted = () => {
    setCompletedQuestions((prev) => new Set([...prev, currentQuestionIndex]));
  };

  const resetPractice = () => {
    setCurrentQuestionIndex(0);
    setCompletedQuestions(new Set());
    setShowTips(false);
    setShowAnswer(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <BrainCircuit className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">
            Loading your interview practice...
          </p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <header className="border-b bg-background/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/generate"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Generate
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

        <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle>No Questions Found</CardTitle>
              <CardDescription>
                Please generate questions first to start practicing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/generate">
                <Button>Generate Questions</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/generate"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Generate
            </Link>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">
                Interview Practice
              </h1>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-32 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {currentQuestion.category}
                  </span>
                  {completedQuestions.has(currentQuestionIndex) && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {completedQuestions.size} of {questions.length} completed
                </div>
              </div>
              <CardTitle className="text-2xl leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Tips Section */}
              {showTips && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <Lightbulb className="h-4 w-4" />
                    Interview Tips
                  </div>
                  <p className="text-blue-800 text-sm leading-relaxed">
                    {currentQuestion.tips}
                  </p>
                </div>
              )}

              {/* Suggested Answer Section */}
              {showAnswer && currentQuestion.suggestedAnswer && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <Eye className="h-4 w-4" />
                    Suggested Answer Approach
                  </div>
                  <p className="text-green-800 text-sm leading-relaxed whitespace-pre-line">
                    {currentQuestion.suggestedAnswer}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={() => setShowTips(!showTips)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  {showTips ? "Hide Tips" : "Show Tips"}
                </Button>

                <Button
                  onClick={() => setShowAnswer(!showAnswer)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {showAnswer ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  {showAnswer ? "Hide Answer" : "Show Answer"}
                </Button>

                <Button
                  onClick={markAsCompleted}
                  variant={
                    completedQuestions.has(currentQuestionIndex)
                      ? "secondary"
                      : "default"
                  }
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {completedQuestions.has(currentQuestionIndex)
                    ? "Completed"
                    : "Mark Complete"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleSkip}
                disabled={isLastQuestion}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SkipForward className="h-4 w-4" />
                Skip
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={resetPractice}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>

              {isLastQuestion ? (
                <Link href="/generate">
                  <Button className="flex items-center gap-2">
                    Generate New Questions
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleNext}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Quick Navigation</h3>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setShowTips(false);
                    setShowAnswer(false);
                  }}
                  className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-primary text-primary-foreground"
                      : completedQuestions.has(index)
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
