import { vi } from "vitest";

export const scoutVacancyRecord = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  scout_vacancy_id: "123e4567-e89b-42d3-a456-426614174001",
  title: "Software Engineer",
  employer_name: "Example Technologies",
  company_logo_url: null,
  description: "<h2>Role</h2><p>Build software applications with the team.</p>",
  location_text: "Cape Town",
  application_url: "https://careers.example.test/apply",
  published_at: null,
  source_updated_at: null,
  updated_at: "2026-11-07T10:00:00Z",
  state: null,
};

export function createQueryMock(result: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const builder: Record<string, any> = {};
  for (const method of [
    "select", "eq", "or", "ilike", "in", "not", "gte",
    "order", "range", "upsert", "delete",
  ]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.maybeSingle = vi.fn(async () => result);
  builder.single = vi.fn(async () => result);
  builder.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
}

export function createSupabaseClientMock(...queries: unknown[]) {
  const from = vi.fn();
  queries.forEach((query) => from.mockReturnValueOnce(query));
  return { from };
}
