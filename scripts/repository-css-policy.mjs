export function validateCssApproval(filePath, manifest) {
  const isStylesheet = /\.(?:css|scss|sass|less)$/i.test(filePath);
  if (!isStylesheet || filePath === "src/styles/tokens.css") return [];
  const approval = manifest.approvals?.find(item => item.path === filePath);
  const required = [
    "reason", "tailwindAlternative", "sharedComponentAlternative",
    "approvedBy", "approvedAt",
  ];
  if (!approval || required.some(key => !String(approval[key] ?? "").trim())) {
    return [
      "stylesheet changes require a complete entry in .css-approvals.json: " +
        filePath,
    ];
  }
  return [];
}
