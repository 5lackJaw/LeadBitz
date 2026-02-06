"use client";

import { FormEvent, useState } from "react";

type InboxSettingsFormProps = {
  inboxConnectionId: string;
  dailySendCap: number;
  sendWindowStartHour: number;
  sendWindowEndHour: number;
  rampUpPerDay: number;
};

export function InboxSettingsForm(props: InboxSettingsFormProps) {
  const [dailySendCap, setDailySendCap] = useState(String(props.dailySendCap));
  const [sendWindowStartHour, setSendWindowStartHour] = useState(String(props.sendWindowStartHour));
  const [sendWindowEndHour, setSendWindowEndHour] = useState(String(props.sendWindowEndHour));
  const [rampUpPerDay, setRampUpPerDay] = useState(String(props.rampUpPerDay));
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/inboxes/${props.inboxConnectionId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dailySendCap: Number(dailySendCap),
          sendWindowStartHour: Number(sendWindowStartHour),
          sendWindowEndHour: Number(sendWindowEndHour),
          rampUpPerDay: Number(rampUpPerDay),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to save inbox settings.");
      }

      setStatusMessage("Inbox settings saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save inbox settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="lb-form-grid" style={{ marginTop: "16px" }}>
      <label className="lb-field">
        <span className="lb-label">Daily send cap</span>
        <input
          className="lb-input"
          name="dailySendCap"
          type="number"
          min={1}
          max={500}
          value={dailySendCap}
          onChange={(event) => setDailySendCap(event.target.value)}
        />
      </label>

      <label className="lb-field">
        <span className="lb-label">Send window start hour (0-23)</span>
        <input
          className="lb-input"
          name="sendWindowStartHour"
          type="number"
          min={0}
          max={23}
          value={sendWindowStartHour}
          onChange={(event) => setSendWindowStartHour(event.target.value)}
        />
      </label>

      <label className="lb-field">
        <span className="lb-label">Send window end hour (1-24)</span>
        <input
          className="lb-input"
          name="sendWindowEndHour"
          type="number"
          min={1}
          max={24}
          value={sendWindowEndHour}
          onChange={(event) => setSendWindowEndHour(event.target.value)}
        />
      </label>

      <label className="lb-field">
        <span className="lb-label">Ramp-up per day</span>
        <input
          className="lb-input"
          name="rampUpPerDay"
          type="number"
          min={1}
          max={100}
          value={rampUpPerDay}
          onChange={(event) => setRampUpPerDay(event.target.value)}
        />
      </label>

      <button className="lb-button lb-button-primary" type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save inbox settings"}
      </button>

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
    </form>
  );
}
