export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => unknown;
};

export function generateCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (value: unknown) => {
    if (value === null || value === undefined) {
      return "";
    }
    const stringValue = String(value);
    if (/[",\n]/u.test(stringValue)) {
      return `"${stringValue.replace(/"/gu, '""')}"`;
    }
    return stringValue;
  };

  const header = columns.map((column) => escape(column.header)).join(",");
  const body = rows
    .map((row) => columns.map((column) => escape(column.accessor(row))).join(","))
    .join("\n");

  return [header, body].filter(Boolean).join("\n");
}

export function downloadCsv(content: string, filename: string) {
  if (typeof window === "undefined") {
    return;
  }
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
