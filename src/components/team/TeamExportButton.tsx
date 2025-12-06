'use client';

import { ExportButton, type ExportFormat } from '@/components/export/ExportButton';
import { exportTeamProgressToExcel, type TeamMemberExportData } from '@/lib/export/excel';

interface TeamExportButtonProps {
  teamMembers: TeamMemberExportData[];
}

/**
 * Client component for exporting team data
 */
export function TeamExportButton({ teamMembers }: TeamExportButtonProps) {
  async function handleExport(format: ExportFormat) {
    if (format === 'excel') {
      await exportTeamProgressToExcel(teamMembers);
    }
    // PDF format not implemented for team data
  }

  return (
    <ExportButton
      onExport={handleExport}
      formats={['excel']}
      label="Экспорт данных команды"
      variant="outline"
    />
  );
}
