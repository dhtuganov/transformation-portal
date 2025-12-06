import * as XLSX from 'xlsx';

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
 * Export team progress data to Excel
 */
export async function exportTeamProgressToExcel(
  members: TeamMemberExportData[]
): Promise<void> {
  // Prepare data for Excel
  const data = members.map((member) => ({
    'ФИО': member.full_name || 'Не указано',
    'Email': member.email,
    'Должность': member.job_title || '-',
    'Подразделение': member.department || '-',
    'Филиал': member.branch || '-',
    'MBTI Тип': member.mbti_type || 'Не определён',
    'MBTI Верифицирован': member.mbti_verified ? 'Да' : 'Нет',
    'Тестов завершено': member.quizzes_completed,
    'Прогресс обучения (%)': member.learning_progress,
    'Статус ИПР': member.ipr_status,
    'Количество ИПР': member.ipr_count,
  }));

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // ФИО
    { wch: 30 }, // Email
    { wch: 25 }, // Должность
    { wch: 20 }, // Подразделение
    { wch: 15 }, // Филиал
    { wch: 12 }, // MBTI Тип
    { wch: 18 }, // MBTI Верифицирован
    { wch: 16 }, // Тестов завершено
    { wch: 20 }, // Прогресс обучения
    { wch: 15 }, // Статус ИПР
    { wch: 15 }, // Количество ИПР
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Команда');

  // Add summary sheet
  const totalMembers = members.length;
  const withMBTI = members.filter(m => m.mbti_type).length;
  const verifiedMBTI = members.filter(m => m.mbti_verified).length;
  const withIPR = members.filter(m => m.ipr_count > 0).length;
  const avgProgress = totalMembers > 0
    ? Math.round(members.reduce((sum, m) => sum + m.learning_progress, 0) / totalMembers)
    : 0;
  const totalQuizzes = members.reduce((sum, m) => sum + m.quizzes_completed, 0);

  const summaryData = [
    { 'Показатель': 'Всего сотрудников', 'Значение': totalMembers },
    { 'Показатель': 'С типом MBTI', 'Значение': withMBTI },
    { 'Показатель': 'MBTI верифицировано', 'Значение': verifiedMBTI },
    { 'Показатель': 'Имеют ИПР', 'Значение': withIPR },
    { 'Показатель': 'Средний прогресс обучения (%)', 'Значение': avgProgress },
    { 'Показатель': 'Всего тестов завершено', 'Значение': totalQuizzes },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 35 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сводка');

  // Generate file
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Команда_Прогресс_${timestamp}.xlsx`;

  // Download
  XLSX.writeFile(workbook, fileName);
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
  const excelData = data.map((item) => ({
    'Сотрудник': item.user_name,
    'Материал': item.content_title,
    'Тип': item.content_type === 'article' ? 'Статья' :
           item.content_type === 'video' ? 'Видео' :
           item.content_type === 'test' ? 'Тест' :
           item.content_type === 'document' ? 'Документ' : 'Чек-лист',
    'Статус': item.status === 'not_started' ? 'Не начато' :
              item.status === 'in_progress' ? 'В процессе' : 'Завершено',
    'Прогресс (%)': item.progress_percent,
    'Время (мин)': item.time_spent_minutes,
    'Начато': item.started_at ? new Date(item.started_at).toLocaleDateString('ru-RU') : '-',
    'Завершено': item.completed_at ? new Date(item.completed_at).toLocaleDateString('ru-RU') : '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 40 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Прогресс обучения');

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Прогресс_Обучения_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
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
  const excelData = data.map((item) => ({
    'Сотрудник': item.user_name,
    'Тест': item.quiz_title,
    'Баллы': item.score,
    'Всего вопросов': item.total_questions,
    'Результат (%)': Math.round((item.score / item.total_questions) * 100),
    'Статус': item.passed ? 'Пройден' : 'Не пройден',
    'Дата': new Date(item.completed_at).toLocaleDateString('ru-RU'),
    'Время (мин)': item.time_taken_minutes,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 35 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Результаты тестов');

  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `Результаты_Тестов_${timestamp}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
