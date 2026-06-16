import React, { useMemo } from "react";
import { BATCH_COLUMNS } from "@/presentation/features/export/batchColumnDefs";
import { parseCsvLine } from "@/presentation/features/export/batchCsvUtils";
import { platform } from "@/presentation/theme/platformStyles";

interface BatchPreviewTableProps {
  csvText: string;
  darkMode?: boolean;
}

export function BatchPreviewTable({ csvText, darkMode = true }: BatchPreviewTableProps) {
  const { headers, rows } = useMemo(() => {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      return { headers: BATCH_COLUMNS.map((c) => c.label), rows: [] as string[][] };
    }
    const headerCells = parseCsvLine(lines[0]);
    const dataRows = lines.slice(1).map((line) => parseCsvLine(line));
    return { headers: headerCells, rows: dataRows };
  }, [csvText]);

  const thClass = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
    darkMode ? "text-gray-400 bg-dark-secondary/50" : "text-gray-500 bg-gray-50"
  }`;
  const tdClass = `px-4 py-3 text-sm font-mono ${platform.textSecondary(darkMode)}`;

  return (
    <div className={`overflow-x-auto rounded-xl border ${platform.border(darkMode)}`}>
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className={`border-b ${platform.borderSubtle(darkMode)}`}>
            <th className={thClass}>#</th>
            {headers.map((h, i) => (
              <th key={`${h}-${i}`} className={thClass}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length + 1}
                className={`px-4 py-12 text-center text-sm ${platform.textMuted(darkMode)}`}
              >
                Import a CSV or Excel file to preview rows here.
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b last:border-b-0 ${platform.borderSubtle(darkMode)} ${
                  darkMode ? "hover:bg-white/5" : "hover:bg-gray-50"
                }`}
              >
                <td className={`${tdClass} text-gray-500`}>{rowIndex + 1}</td>
                {headers.map((_, colIndex) => (
                  <td key={colIndex} className={tdClass}>
                    {row[colIndex] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
