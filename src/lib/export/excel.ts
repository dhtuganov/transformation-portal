import ExcelJS from 'exceljs';

/**
 * Team member data for export
 */
export interface TeamMemberExportData {
  id: string;
  full_name: string | null;
  email: string;
  department: string | null;
  branch: string | null;
  job_title: string | null;
  mbti_type: string | null;
  mbti_verified: boolean;
  quizzes_completed: number;
  learning_progress: number;
  ipr_status: string;
  ipr_count: number;
}

/**
 * Helper to trigger file download in browser
 */
async function downloadWorkbook(workbook: ExcelJS.Workbook, fileName: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export team progress data to Excel
 */
export async function exportTeamProgressToExcel(
  members: TeamMemberExportData[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Otrar Portal';
  workbook.created = new Date();

  // Team sheet
  const teamSheet = workbook.addWorksheet('Команда');

  teamSheet.columns = [
    { header: 'ФИО', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Должность', key: 'job_title', width: 25 },
    { header: 'Подразделение', key: 'department', width: 20 },
    { header: 'Филиал', key: 'branch', width: 15 },
    { header: 'MBTI Тип', key: 'mbti_type', width: 12 },
    { header: 'MBTI Верифицирован', key: 'mbti_verified', width: 18 },
    { header: 'Тестов завершено', key: 'quizzes', width: 16 },
    { header: 'Прогресс обучения (%)', key: 'progress', width: 20 },
    { header: 'Статус ИПР', key: 'ipr_status', width: 15 },
    { header: 'Количество ИПР', key: 'ipr_count', width: 15 },
  ];

  // Style header row
  teamSheet.getRow(1).font = { bold: true };
  teamSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add data
  members.forEach((member) => {
    teamSheet.addRow({
      name: member.full_name || 'Не указано',
      email: member.email,
      job_title: member.job_title || '-',
      department: member.department || '-',
      branch: member.branch || '-',
      mbti_type: member.mbti_type || 'Не определён',
      mbti_verified: member.mbti_verified ? 'Да' : 'Нет',
      quizzes: member.quizzes_completed,
      progress: member.learning_progress,
      ipr_status: member.ipr_status,
      ipr_count: member.ipr_count,
    });
  });

  // Summary sheet
  const summarySheet = workbook.addWorksheet('Сводка');

  const totalMembers = members.length;
  const withMBTI = members.filter(m => m.mbti_type).length;
  const verifiedMBTI = members.filter(m => m.mbti_verified).length;
  const withIPR = members.filter(m => m.ipr_count > 0).length;
  const avgProgress = totalMembers > 0
    ? Math.round(members.reduce((sum, m) => sum + m.learning_progress, 0) / totalMembers)
    : 0;
  const totalQuizzes = members.reduce((sum, m) => sum + m.quizzes_completed, 0);

  summarySheet.columns = [
    { header: 'Показатель', key: 'metric', width: 35 },
    { header: 'Значение', key: 'value', width: 15 },
  ];

  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  summarySheet.addRows([
    { metric: 'Всего сотрудников', value: totalMembers },
    { metric: 'С типом MBTI', value: withMBTI },
    { metric: 'MBTI верифицировано', value: verifiedMBTI },
    { metric: 'Имеют ИПР', value: withIPR },
    { metric: 'Средний прогресс обучения (%)', value: avgProgress },
    { metric: 'Всего тестов завершено', value: totalQuizzes },
  ]);

  // Download
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Команда_Прогресс_${timestamp}.xlsx`;
  await downloadWorkbook(workbook, fileName);
}

/**
 * Export learning content progress to Excel
 */
export async function exportLearningProgressToExcel(
  data: {
    user_name: string;
    content_title: string;
    content_type: string;
    status: string;
    progress_percent: number;
    time_spent_minutes: number;
    started_at: string | null;
    completed_at: string | null;
  }[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Otrar Portal';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Прогресс обучения');

  sheet.columns = [
    { header: 'Сотрудник', key: 'user', width: 25 },
    { header: 'Материал', key: 'content', width: 40 },
    { header: 'Тип', key: 'type', width: 12 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Прогресс (%)', key: 'progress', width: 12 },
    { header: 'Время (мин)', key: 'time', width: 12 },
    { header: 'Начато', key: 'started', width: 15 },
    { header: 'Завершено', key: 'completed', width: 15 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  const typeMap: Record<string, string> = {
    article: 'Статья',
    video: 'Видео',
    test: 'Тест',
    document: 'Документ',
  };

  const statusMap: Record<string, string> = {
    not_started: 'Не начато',
    in_progress: 'В процессе',
    completed: 'Завершено',
  };

  data.forEach((item) => {
    sheet.addRow({
      user: item.user_name,
      content: item.content_title,
      type: typeMap[item.content_type] || 'Чек-лист',
      status: statusMap[item.status] || item.status,
      progress: item.progress_percent,
      time: item.time_spent_minutes,
      started: item.started_at ? new Date(item.started_at).toLocaleDateString('ru-RU') : '-',
      completed: item.completed_at ? new Date(item.completed_at).toLocaleDateString('ru-RU') : '-',
    });
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Прогресс_Обучения_${timestamp}.xlsx`;
  await downloadWorkbook(workbook, fileName);
}

/**
 * Export quiz results to Excel
 */
export async function exportQuizResultsToExcel(
  data: {
    user_name: string;
    quiz_title: string;
    score: number;
    total_questions: number;
    passed: boolean;
    completed_at: string;
    time_taken_minutes: number;
  }[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Otrar Portal';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Результаты тестов');

  sheet.columns = [
    { header: 'Сотрудник', key: 'user', width: 25 },
    { header: 'Тест', key: 'quiz', width: 35 },
    { header: 'Баллы', key: 'score', width: 10 },
    { header: 'Всего вопросов', key: 'total', width: 15 },
    { header: 'Результат (%)', key: 'percent', width: 15 },
    { header: 'Статус', key: 'status', width: 15 },
    { header: 'Дата', key: 'date', width: 15 },
    { header: 'Время (мин)', key: 'time', width: 12 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  data.forEach((item) => {
    sheet.addRow({
      user: item.user_name,
      quiz: item.quiz_title,
      score: item.score,
      total: item.total_questions,
      percent: Math.round((item.score / item.total_questions) * 100),
      status: item.passed ? 'Пройден' : 'Не пройден',
      date: new Date(item.completed_at).toLocaleDateString('ru-RU'),
      time: item.time_taken_minutes,
    });
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Результаты_Тестов_${timestamp}.xlsx`;
  await downloadWorkbook(workbook, fileName);
}
