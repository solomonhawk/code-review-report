import { ReportSummary } from "~/lib/types";

export interface FormatterImpl {
  format: (report: ReportSummary) => string;
}
