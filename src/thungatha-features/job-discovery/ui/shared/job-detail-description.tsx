import { Button } from "@/components/ui/button";
import "./job-discovery-components.css";

type Props = { description?: string | null };

export function JobDetailDescription({ description }: Props) {
  return (
    <section className="th-jobs-description-panel th-jobs-redesign-description">
      <div className="th-jobs-description-tabs" role="tablist" aria-label="Job information">
        <Button variant="ghost" size="sm" role="tab" aria-selected="true">Job description</Button>
        <Button variant="ghost" size="sm" role="tab" aria-selected="false" onClick={() => document.getElementById("th-job-requirements")?.scrollIntoView({ block: "nearest" })}>Requirements</Button>
        <Button variant="ghost" size="sm" role="tab" aria-selected="false" onClick={() => document.getElementById("th-job-benefits")?.scrollIntoView({ block: "nearest" })}>Benefits</Button>
        <Button variant="ghost" size="sm" role="tab" aria-selected="false" onClick={() => document.getElementById("th-job-about")?.scrollIntoView({ block: "nearest" })}>About the company</Button>
      </div>
      <div className="th-jobs-description-body th-job-description-content">
        {description?.trim() || "A full job description has not been supplied by the source. Open the employer's application page to review the role requirements before applying."}
        <section id="th-job-requirements"><h3>Requirements</h3><p>Requirements will appear here when provided by the employer. Thungatha will not invent missing requirements.</p></section>
        <section id="th-job-benefits"><h3>Benefits</h3><p>Benefits have not been supplied in the available listing.</p></section>
        <section id="th-job-about"><h3>About the company</h3><p>Company information will appear here when an official employer source is available.</p></section>
      </div>
    </section>
  );
}
