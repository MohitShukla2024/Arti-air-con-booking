import { NextResponse } from "next/server";

/**
 * Server-side Error Logger & Client Response Sanitizer
 *
 * Logs full stack traces and error details to server stdout for debugging
 * while returning clean, generic HTTP 500 responses to the client to prevent
 * information leakage (e.g. database error codes, file paths, or internal logic).
 */
export function handleServerError(
  context: string,
  error: unknown,
  customMessage = "An unexpected error occurred. Please try again later.",
  statusCode = 500
): NextResponse {
  // Extract error message safely for server logging
  const errorMsg = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  // Log full error details server-side for observability and debugging
  console.error(`[SERVER_ERROR] [${context}]`, {
    timestamp: new Date().toISOString(),
    message: errorMsg,
    stack,
    raw: error,
  });

  // Return sanitized generic response to client
  return NextResponse.json(
    {
      success: false,
      message: customMessage,
    },
    { status: statusCode }
  );
}
