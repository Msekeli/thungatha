"use client";

import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { JobDetailTabs } from "./job-detail-tabs";

type Props = { description?: string | null };
const sections = [
  {
    value: "requirements",
    title: "Requirements",
    text: "Requirements will appear here when provided by the employer. Thungatha will not invent missing requirements.",
  },
  {
    value: "benefits",
    title: "Benefits",
    text: "Benefits have not been supplied in the available listing.",
  },
  {
    value: "company",
    title: "About the company",
    text: "Company information will appear here when an official employer source is available.",
  },
];

export function JobDetailDescription({ description }: Props) {
  const [activeTab, setActiveTab] = useState("description");
  const activeSection = sections.find((section) => section.value === activeTab);
  return (
    <Box
      className="th-job-description-panel"
      sx={{
        display: "flex",
        flex: "1 1 0%",
        flexDirection: "column",
        minHeight: 0,
        minWidth: 0,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box sx={{ flex: "0 0 auto", minWidth: 0 }}>
        <JobDetailTabs value={activeTab} onChange={setActiveTab} />
      </Box>
      <Stack
        className="th-job-description-body"
        spacing={1.25}
        sx={{
          flex: "1 1 0%",
          minHeight: 0,
          minWidth: 0,
          overflowY: "auto",
          overscrollBehavior: "contain",
          p: { xs: 1.5, sm: 2 },
        }}
      >
        {activeTab === "description" ? (
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              flex: "0 0 auto",
              lineHeight: 1.65,
            }}
          >
            {description?.trim() ||
              "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
          </Typography>
        ) : activeSection ? (
          <Box>
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{ fontWeight: 700 }}
            >
              {activeSection.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeSection.text}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );
}
