-- Responses: survey/study answers linked to enrollment (not wallet)
-- Flexible jsonb structure; no PII. One response per enrollment.

CREATE TABLE responses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments (id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (enrollment_id)
);

CREATE INDEX idx_responses_enrollment ON responses (enrollment_id);

COMMENT ON TABLE responses IS 'Survey/study answers per enrollment. response_data is flexible jsonb (e.g. { "q1": "...", "q2": [...] }). Do not store PII.';
