import { CandidateVerificationStatus, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  EmailVerificationClient,
  EmailVerificationResult,
} from "@/lib/sources/email-verification-client";

export class EmailVerificationWorkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailVerificationWorkerError";
  }
}

type BatchVerifier = {
  providerKey: string;
  verifyBatch(emails: string[]): Promise<EmailVerificationResult[]>;
};

function getConnectorConfigApiKey(configJson: unknown): string | null {
  if (!configJson || typeof configJson !== "object" || Array.isArray(configJson)) {
    return null;
  }

  const maybeApiKey = (configJson as Record<string, unknown>).apiKey;
  if (typeof maybeApiKey !== "string") {
    return null;
  }

  const normalized = maybeApiKey.trim();
  return normalized || null;
}

async function buildVerifierForSourceRun(input: {
  providerKey: string;
  connectorConfig: unknown;
}): Promise<BatchVerifier> {
  const providerKey = input.providerKey.toLowerCase();
  const apiKey = getConnectorConfigApiKey(input.connectorConfig);

  if (!apiKey) {
    throw new EmailVerificationWorkerError("Verification connector is missing apiKey config.");
  }

  return new EmailVerificationClient({
    providerKey,
    apiKey,
  });
}

function normalizeResultMap(results: EmailVerificationResult[]): Map<string, EmailVerificationResult> {
  const map = new Map<string, EmailVerificationResult>();

  for (const result of results) {
    const email = result.email.trim().toLowerCase();
    if (!email) {
      continue;
    }

    map.set(email, {
      ...result,
      email,
    });
  }

  return map;
}

export type EmailVerificationBatchStats = {
  sourceRunId: string;
  emailsQueued: number;
  verificationRowsWritten: number;
  candidatesUpdated: number;
};

export async function verifyCandidateEmailsForSourceRun(input: {
  sourceRunId: string;
  verifier?: BatchVerifier;
}): Promise<EmailVerificationBatchStats> {
  const sourceRun = await prisma.sourceRun.findUnique({
    where: {
      id: input.sourceRunId,
    },
    include: {
      connector: {
        select: {
          providerKey: true,
          configJson: true,
        },
      },
      candidates: {
        where: {
          email: {
            not: "",
          },
          verificationStatus: CandidateVerificationStatus.UNKNOWN,
        },
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!sourceRun) {
    throw new EmailVerificationWorkerError("Source run not found.");
  }

  const uniqueEmails = Array.from(
    new Set(sourceRun.candidates.map((candidate) => candidate.email.trim().toLowerCase()).filter(Boolean)),
  );

  if (uniqueEmails.length === 0) {
    return {
      sourceRunId: sourceRun.id,
      emailsQueued: 0,
      verificationRowsWritten: 0,
      candidatesUpdated: 0,
    };
  }

  const verifier =
    input.verifier ??
    (await buildVerifierForSourceRun({
      providerKey: sourceRun.connector.providerKey,
      connectorConfig: sourceRun.connector.configJson,
    }));

  const verificationResults = await verifier.verifyBatch(uniqueEmails);
  const resultMap = normalizeResultMap(verificationResults);

  const now = new Date();
  const verificationRows: Prisma.EmailVerificationCreateManyInput[] = uniqueEmails.map((email) => {
    const result = resultMap.get(email);

    return {
      workspaceId: sourceRun.workspaceId,
      email,
      providerKey: verifier.providerKey,
      status: result?.status ?? CandidateVerificationStatus.UNKNOWN,
      detailsJson: result?.details
        ? (result.details as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      checkedAt: result?.checkedAt ?? now,
    };
  });

  if (verificationRows.length > 0) {
    await prisma.emailVerification.createMany({
      data: verificationRows,
    });
  }

  let candidatesUpdated = 0;
  for (const email of uniqueEmails) {
    const status = resultMap.get(email)?.status ?? CandidateVerificationStatus.UNKNOWN;

    const result = await prisma.candidate.updateMany({
      where: {
        sourceRunId: sourceRun.id,
        email,
      },
      data: {
        verificationStatus: status,
      },
    });

    candidatesUpdated += result.count;
  }

  return {
    sourceRunId: sourceRun.id,
    emailsQueued: uniqueEmails.length,
    verificationRowsWritten: verificationRows.length,
    candidatesUpdated,
  };
}
