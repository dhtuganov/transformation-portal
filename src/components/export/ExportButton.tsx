'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

export type ExportFormat = 'pdf' | 'excel';

interface ExportButtonProps {
  onExport: (format: ExportFormat) => Promise<void>;
  formats?: ExportFormat[];
  disabled?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  label?: string;
  className?: string;
}

/**
 * Reusable export button with dropdown for format selection
 */
export function ExportButton({
  onExport,
  formats = ['pdf', 'excel'],
  disabled = false,
  size = 'default',
  variant = 'outline',
  label = 'Экспорт',
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
      // You could add toast notification here
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  // If only one format, render simple button
  if (formats.length === 1) {
    const format = formats[0];
    const Icon = format === 'pdf' ? FileText : FileSpreadsheet;
    const formatLabel = format === 'pdf' ? 'PDF' : 'Excel';

    return (
      <Button
        onClick={() => handleExport(format)}
        disabled={disabled || isExporting}
        size={size}
        variant={variant}
        className={className}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        {label} ({formatLabel})
      </Button>
    );
  }

  // Multiple formats - render dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={disabled || isExporting}
          size={size}
          variant={variant}
          className={className}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting && exportingFormat
            ? `Экспорт ${exportingFormat === 'pdf' ? 'PDF' : 'Excel'}...`
            : label
          }
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.includes('pdf') && (
          <DropdownMenuItem
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <FileText className="h-4 w-4 mr-2" />
            Экспорт в PDF
          </DropdownMenuItem>
        )}
        {formats.includes('excel') && (
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            disabled={isExporting}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Экспорт в Excel
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
