"use client";

import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { JobDetailTabs } from "./job-detail-tabs";

type Props = { description?: string | null };
const sections = [
  { value: "requirements", title: "Requirements", text: "Requirements will appear here when provided by the employer. Thungatha will not invent missing requirements." },
  { value: "benefits", title: "Benefits", text: "Benefits have not been supplied in the available listing." },
  { value: "company", title: "About the company", text: "Company information will appear here when an official employer source is available." },
];

export function JobDetailDescription({ description }: Props) {
  const [activeTab, setActiveTab] = useState("description");
  const activeSection = sections.find((section) => section.value === activeTab);
  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
      <JobDetailTabs value={activeTab} onChange={setActiveTab} />
      <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 } }}>
        {activeTab === "description" ? <Typography variant="body2" sx={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
          {description?.trim() || "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
        </Typography> : activeSection ? <Box>
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>{activeSection.title}</Typography>
          <Typography variant="body2" color="text.secondary">{activeSection.text}</Typography>
        </Box> : null}
      </Stack>
    </Box>
  );
}
