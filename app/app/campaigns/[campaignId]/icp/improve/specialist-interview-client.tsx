"use client";

import { FormEvent, useMemo, useState } from "react";

import type { InterviewQuestion } from "@/lib/icp/specialist-interview";

type SpecialistInterviewClientProps = {
  campaignId: string;
  baseIcpVersionId: string;
  baseIcpVersionTitle: string;
  baseIcpVersionSource: string;
  baseIcpVersionUpdatedAt: string;
};

type InterviewStartResponse = {
  sessionId?: string;
  firstQuestions?: InterviewQuestion[];
  startedAt?: string;
  error?: string;
};

type InterviewAnswerResponse = {
  nextQuestions?: InterviewQuestion[];
  done?: boolean;
  error?: string;
};

type InterviewCompleteResponse = {
  icpVersionId?: string;
  diffSummary?: string[];
  error?: string;
};

export function SpecialistInterviewClient({
  campaignId,
  baseIcpVersionId,
  baseIcpVersionTitle,
  baseIcpVersionSource,
  baseIcpVersionUpdatedAt,
}: SpecialistInterviewClientProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmittingAnswers, setIsSubmittingAnswers] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [completedIcpVersionId, setCompletedIcpVersionId] = useState<string | null>(null);
  const [diffSummary, setDiffSummary] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unresolvedCount = useMemo(
    () => questions.filter((question) => !(answers[question.key]?.trim() ?? "")).length,
    [answers, questions],
  );

  async function onStartInterview() {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsStarting(true);

    try {
      const response = await fetch("/api/icp/interview/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
          icpVersionId: baseIcpVersionId,
        }),
      });

      const data = (await response.json()) as InterviewStartResponse;
      if (!response.ok || !data.sessionId || !Array.isArray(data.firstQuestions)) {
        throw new Error(data.error ?? "Failed to start specialist interview.");
      }

      setSessionId(data.sessionId);
      setQuestions(data.firstQuestions);
      setAnswers({});
      setIsDone(false);
      setCompletedIcpVersionId(null);
      setDiffSummary([]);
      setStatusMessage("Interview session started. Answer all required prompts to generate an improved ICP.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to start specialist interview.");
    } finally {
      setIsStarting(false);
    }
  }

  async function onSubmitAnswers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (!sessionId) {
      setErrorMessage("Start an interview session first.");
      return;
    }

    setIsSubmittingAnswers(true);

    try {
      const response = await fetch("/api/icp/interview/answer", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          answers,
        }),
      });

      const data = (await response.json()) as InterviewAnswerResponse;
      if (!response.ok || !Array.isArray(data.nextQuestions) || typeof data.done !== "boolean") {
        throw new Error(data.error ?? "Failed to submit interview answers.");
      }

      setQuestions(data.nextQuestions);
      setIsDone(data.done);
      setStatusMessage(
        data.done
          ? "All required questions are complete. You can now create the Specialist ICP version."
          : "Answers saved. Continue with the remaining interview prompts.",
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit interview answers.");
    } finally {
      setIsSubmittingAnswers(false);
    }
  }

  async function onCompleteInterview() {
    setErrorMessage(null);
    setStatusMessage(null);

    if (!sessionId) {
      setErrorMessage("Start an interview session first.");
      return;
    }

    setIsCompleting(true);

    try {
      const response = await fetch("/api/icp/interview/complete", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      });

      const data = (await response.json()) as InterviewCompleteResponse;
      if (!response.ok || !data.icpVersionId || !Array.isArray(data.diffSummary)) {
        throw new Error(data.error ?? "Failed to complete specialist interview.");
      }

      setCompletedIcpVersionId(data.icpVersionId);
      setDiffSummary(data.diffSummary);
      setStatusMessage("Specialist ICP version created and set as active.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to complete specialist interview.");
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <>
      <section className="lb-panel">
        <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
          Base ICP Version
        </h2>
        <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
          <p className="lb-subtitle">
            Version title: <strong>{baseIcpVersionTitle}</strong>
          </p>
          <p className="lb-subtitle">
            Source: <strong>{baseIcpVersionSource}</strong>
          </p>
          <p className="lb-subtitle">Last updated: {new Date(baseIcpVersionUpdatedAt).toLocaleString()}</p>
          <code style={{ fontFamily: "var(--font-ui-mono)", color: "var(--ui-fg-muted)" }}>
            {baseIcpVersionId}
          </code>
        </div>
        <div style={{ marginTop: "14px" }}>
          <button className="lb-button lb-button-primary" type="button" onClick={onStartInterview} disabled={isStarting}>
            {isStarting ? "Starting..." : "Start Specialist Interview"}
          </button>
        </div>
      </section>

      {sessionId ? (
        <section className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Interview Questions
          </h2>
          <p className="lb-subtitle" style={{ marginTop: "8px" }}>
            Session id: {sessionId}
          </p>
          <p className="lb-subtitle">
            Remaining required prompts: <strong>{unresolvedCount}</strong>
          </p>

          {questions.length > 0 ? (
            <form className="lb-form-grid" style={{ marginTop: "16px" }} onSubmit={onSubmitAnswers}>
              {questions.map((question) => (
                <label key={question.key} className="lb-field">
                  <span className="lb-label">{question.label}</span>
                  <textarea
                    className="lb-input"
                    style={{ minHeight: "100px", resize: "vertical" }}
                    value={answers[question.key] ?? ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.key]: event.target.value,
                      }))
                    }
                    placeholder={question.placeholder}
                    disabled={isSubmittingAnswers || isCompleting}
                  />
                </label>
              ))}
              <button
                className="lb-button lb-button-secondary"
                type="submit"
                disabled={isSubmittingAnswers || isCompleting}
              >
                {isSubmittingAnswers ? "Saving answers..." : "Save interview answers"}
              </button>
            </form>
          ) : (
            <p className="lb-subtitle" style={{ marginTop: "12px" }}>
              No remaining prompts. Complete the interview to generate the improved ICP version.
            </p>
          )}

          <div style={{ marginTop: "16px" }}>
            <button
              className="lb-button lb-button-primary"
              type="button"
              onClick={onCompleteInterview}
              disabled={!isDone || isCompleting || isSubmittingAnswers}
            >
              {isCompleting ? "Completing..." : "Complete interview and create ICP version"}
            </button>
          </div>
        </section>
      ) : null}

      {completedIcpVersionId ? (
        <section className="lb-panel">
          <h2 className="lb-title" style={{ fontSize: "20px", lineHeight: "28px" }}>
            Improved ICP Created
          </h2>
          <p className="lb-subtitle" style={{ marginTop: "8px" }}>
            New active ICP version id:
          </p>
          <code style={{ fontFamily: "var(--font-ui-mono)", color: "var(--ui-fg-muted)" }}>
            {completedIcpVersionId}
          </code>
          <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
            <p className="lb-subtitle">Diff summary:</p>
            <ul className="lb-subtitle" style={{ margin: 0, paddingLeft: "20px" }}>
              {diffSummary.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {statusMessage ? (
        <p className="lb-alert lb-alert-success" role="status">
          {statusMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="lb-alert lb-alert-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
