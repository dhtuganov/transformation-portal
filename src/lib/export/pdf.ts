import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DevelopmentPlan, DevelopmentGoalWithMilestones } from '@/types/ipr';
import {
  GOAL_CATEGORY_LABELS,
  GOAL_PRIORITY_LABELS,
  GOAL_STATUS_LABELS
} from '@/types/ipr';

// Add autoTable to jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

/**
 * Format date to Russian locale
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Export Individual Development Plan to PDF
 */
export async function exportIPRToPDF(
  plan: DevelopmentPlan,
  goals: DevelopmentGoalWithMilestones[],
  userName: string
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set font to support Cyrillic (using basic font)
  doc.setFont('helvetica');

  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text('Индивидуальный план развития', 105, yPosition, { align: 'center' });
  yPosition += 10;

  // User name
  doc.setFontSize(12);
  doc.text(`Сотрудник: ${userName}`, 20, yPosition);
  yPosition += 10;

  // Plan details
  doc.setFontSize(10);
  doc.text(`Название: ${plan.title}`, 20, yPosition);
  yPosition += 6;

  if (plan.description) {
    const descLines = doc.splitTextToSize(`Описание: ${plan.description}`, 170);
    doc.text(descLines, 20, yPosition);
    yPosition += descLines.length * 5;
  }

  doc.text(`Период: ${formatDate(plan.period_start)} - ${formatDate(plan.period_end)}`, 20, yPosition);
  yPosition += 6;

  const statusLabel = plan.status === 'draft' ? 'Черновик' :
                      plan.status === 'active' ? 'Активный' :
                      plan.status === 'completed' ? 'Завершён' : 'Архив';
  doc.text(`Статус: ${statusLabel}`, 20, yPosition);
  yPosition += 6;

  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress_percent, 0) / goals.length)
    : 0;
  doc.text(`Общий прогресс: ${totalProgress}%`, 20, yPosition);
  yPosition += 15;

  // Goals section
  doc.setFontSize(14);
  doc.text('Цели развития', 20, yPosition);
  yPosition += 10;

  // Goals table
  if (goals.length > 0) {
    const goalsData = goals.map((goal) => [
      goal.title,
      GOAL_CATEGORY_LABELS[goal.category].label,
      GOAL_PRIORITY_LABELS[goal.priority].label,
      GOAL_STATUS_LABELS[goal.status].label,
      `${goal.progress_percent}%`,
      formatDate(goal.due_date),
    ]);

    autoTable(doc, {
      head: [['Цель', 'Категория', 'Приоритет', 'Статус', 'Прогресс', 'Срок']],
      body: goalsData,
      startY: yPosition,
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
      },
    });

    yPosition = doc.lastAutoTable?.finalY || yPosition;
    yPosition += 15;
  } else {
    doc.setFontSize(10);
    doc.text('Цели пока не добавлены', 20, yPosition);
    yPosition += 10;
  }

  // Goal details with milestones
  if (goals.length > 0) {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.text('Детальная информация по целям', 20, yPosition);
    yPosition += 10;

    goals.forEach((goal, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Goal header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${goal.title}`, 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      if (goal.description) {
        const descLines = doc.splitTextToSize(`Описание: ${goal.description}`, 170);
        doc.text(descLines, 25, yPosition);
        yPosition += descLines.length * 4 + 2;
      }

      doc.text(`Категория: ${GOAL_CATEGORY_LABELS[goal.category].label}`, 25, yPosition);
      yPosition += 4;
      doc.text(`Приоритет: ${GOAL_PRIORITY_LABELS[goal.priority].label}`, 25, yPosition);
      yPosition += 4;
      doc.text(`Статус: ${GOAL_STATUS_LABELS[goal.status].label}`, 25, yPosition);
      yPosition += 4;
      doc.text(`Прогресс: ${goal.progress_percent}%`, 25, yPosition);
      yPosition += 4;
      doc.text(`Срок: ${formatDate(goal.due_date)}`, 25, yPosition);
      yPosition += 6;

      // Milestones
      if (goal.milestones && goal.milestones.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Этапы:', 25, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        goal.milestones.forEach((milestone, mIndex) => {
          const status = milestone.status === 'completed' ? '✓' : '○';
          const text = `${status} ${milestone.title} (${formatDate(milestone.due_date)})`;
          const lines = doc.splitTextToSize(text, 165);
          doc.text(lines, 30, yPosition);
          yPosition += lines.length * 4;
        });
      }

      yPosition += 5;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Страница ${i} из ${pageCount}`,
      105,
      287,
      { align: 'center' }
    );
    doc.text(
      `Создано: ${new Date().toLocaleDateString('ru-RU')}`,
      20,
      287
    );
  }

  // Download
  const fileName = `IPR_${userName.replace(/\s+/g, '_')}_${plan.title.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}
