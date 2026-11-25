import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';

type LogAttributes = Record<string, string | number | boolean>;

const posthogKey = process.env.VITE_POSTHOG_KEY;
const posthogHost = process.env.VITE_POSTHOG_HOST;
let posthogLogger: { emit(record: { body: string; severityText: string; attributes: LogAttributes }): void } | undefined;

if (posthogKey && posthogHost) {
  try {
    const logProvider = new LoggerProvider({
      resource: resourceFromAttributes({
        'service.name': 'gingerbros-api',
        'deployment.environment': process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
      }),
      processors: [
        new BatchLogRecordProcessor(
          new OTLPLogExporter({
            url: new URL('/i/v1/logs', posthogHost).toString(),
            headers: { Authorization: `Bearer ${posthogKey}` },
          }),
        ),
      ],
    });

    // Keep this logger separate from console and application loggers so only
    // records explicitly added for PostHog leave the application.
    posthogLogger = logProvider.getLogger('gingerbros-posthog-logs');

    process.once('SIGTERM', () => {
      void logProvider.shutdown().catch(() => {
        // Shutdown logging must not delay serverless termination.
      });
    });
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('PostHog log exporter could not be configured; application logs will remain local.');
    }
  }
} else if (process.env.NODE_ENV !== 'production') {
  const missingVariable = posthogKey ? 'VITE_POSTHOG_HOST' : 'VITE_POSTHOG_KEY';
  console.warn(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

/** Emits only purpose-written, non-PII records to the dedicated PostHog exporter. */
export function emitPosthogLog(body: string, attributes: LogAttributes): void {
  try {
    posthogLogger?.emit({ body, severityText: 'info', attributes });
  } catch {
    // Logging must never interrupt a request.
  }
}
