/**
 * Structured Error & Runtime Logger for MonÉcole+
 * Formats errors for Vercel Runtime Logs and Sentry/Monitoring integration
 */

export interface LogErrorContext {
  route?: string
  userId?: number | string
  schoolId?: number | string
  action?: string
  extra?: Record<string, any>
}

export function logError(error: any, context: LogErrorContext = {}) {
  const timestamp = new Date().toISOString()
  const errorMessage = error?.message || String(error)
  const stackTrace = error?.stack || "No stack trace available"

  const logPayload = {
    tag: "[MONECOLE_RUNTIME_ERROR]",
    timestamp,
    route: context.route || "unknown",
    action: context.action || "unknown",
    userId: context.userId || "anonymous",
    schoolId: context.schoolId || "none",
    message: errorMessage,
    stack: stackTrace,
    extra: context.extra || {}
  }

  // Print structured JSON payload to stdout/stderr for Vercel log ingestion
  console.error(JSON.stringify(logPayload))
}

export function logInfo(message: string, context: Record<string, any> = {}) {
  console.log(JSON.stringify({
    tag: "[MONECOLE_INFO]",
    timestamp: new Date().toISOString(),
    message,
    ...context
  }))
}
