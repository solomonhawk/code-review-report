export interface IOImpl {
  write: (formattedReport: string) => void;
  onError: (error: Error) => void;
}
