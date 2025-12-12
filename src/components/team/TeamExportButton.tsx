'use client';

import { useState } from 'react';
import { ExportButton, type ExportFormat } from '@/components/export/ExportButton';
import type { TeamMemberExportData } from '@/lib/export/excel';

interface TeamExportButtonProps {
  teamMembers: TeamMemberExportData[];
}

/**
 * Client component for exporting team data
 * Uses dynamic import to lazy-load exceljs (~400KB) only when user clicks export
 */
export function TeamExportButton({ teamMembers }: TeamExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: ExportFormat) {
    if (format === 'excel') {
      setIsExporting(true);
      try {
        // Dynamic import - exceljs loads only on click
        const { exportTeamProgressToExcel } = await import('@/lib/export/excel');
        await exportTeamProgressToExcel(teamMembers);
      } finally {
        setIsExporting(false);
      }
    }
    // PDF format not implemented for team data
  }

  return (
    <ExportButton
      onExport={handleExport}
      formats={['excel']}
      label={isExporting ? 'Загрузка...' : 'Экспорт данных команды'}
      variant="outline"
      disabled={isExporting}
    />
  );
}
