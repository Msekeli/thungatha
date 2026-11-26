import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobFeedQuery } from "./job-feed-query-schema";
import { buildFeedJobQuery } from "./job-feed-query-builder";
import type { FeedJob } from "./job-feed-sorting";

const BATCH_SIZE = 500;

export async function readJobFeedRows(
  db: SupabaseClient,
  input: JobFeedQuery,
  queryOpts: Parameters<typeof buildFeedJobQuery>[2],
  profileVersion: number | null,
) {
  let data: FeedJob[] = [];
  let count = 0;
  let rankWhole = false;
  const from = (input.page - 1) * input.pageSize;

  if (input.sortOrder === "relevance" && profileVersion !== null) {
    for (let offset = 0; ; offset += BATCH_SIZE) {
      const bRes = await buildFeedJobQuery(db, input, queryOpts)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .order("id", { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);
      if (bRes.error) throw bRes.error;
      const batch = (bRes.data ?? []) as FeedJob[];
      data.push(...batch);
      count = bRes.count ?? data.length;
      if (
        (bRes.count !== null && data.length >= bRes.count) ||
        batch.length < BATCH_SIZE
      ) {
        rankWhole = true;
        break;
      }
    }
  }

  if (!rankWhole) {
    const pRes = await buildFeedJobQuery(db, input, queryOpts)
      .order("published_at", {
        ascending: input.sortOrder === "oldest",
        nullsFirst: false,
      })
      .order("updated_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + input.pageSize - 1);
    if (pRes.error) throw pRes.error;
    data = (pRes.data ?? []) as FeedJob[];
    count = pRes.count ?? count;
  }

  return { data, count, rankWhole, from };
}
