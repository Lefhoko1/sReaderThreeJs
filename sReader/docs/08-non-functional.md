# Non-Functional Requirements

- Performance: sub-100ms screen interactions; 2s cold start target.
- Reliability: sync retries, exponential backoff, offline resilience.
- Scalability: stateless API, horizontal scale, DB indexes & partitioning.
- Security: JWT/OAuth, row-level permission checks, encrypted storage at rest.
- Privacy: user-controlled visibility and consent; COPPA-like considerations for minors.
- Accessibility: screen reader, color contrast, large-text modes.
- Telemetry: anonymized usage metrics; opt-out.
