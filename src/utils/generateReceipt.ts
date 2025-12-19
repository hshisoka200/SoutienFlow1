// @ts-ignore
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { Student, Enrollment } from '../../types';

const parseSubjects = (subj: string | string[]): Enrollment[] => {
  if (Array.isArray(subj)) {
    // Check if it's already an array of Enrollment objects
    if (subj.length > 0 && typeof subj[0] === 'object') return subj as any;
    // Legacy string array -> convert to mock Enrollment
    return (subj as string[]).map(s => ({
      subject: s,
      level: 'N/A',
      teacherName: '-',
      price: 0
    }));
  }
  if (!subj) return [];
  try {
    const parsed = JSON.parse(subj);
    if (Array.isArray(parsed)) {
      if (parsed.length > 0 && typeof parsed[0] === 'object') return parsed;
      return parsed.map(s => ({ subject: s, level: 'N/A', teacherName: '-', price: 0 }));
    }
    return [{ subject: subj, level: 'N/A', teacherName: '-', price: 0 }];
  } catch {
    return [{ subject: subj as string, level: 'N/A', teacherName: '-', price: 0 }];
  }
};

export const generatePDF = (student: Student, centerName: string) => {
  const element = document.createElement('div');
  element.style.width = '100%';
  element.style.fontFamily = "'Tajawal', 'Segoe UI', 'Arial', sans-serif";
  element.dir = 'rtl';

  const date = new Date().toLocaleDateString('fr-FR');
  const studentName = student.full_name || student.name;
  const displayCenterName = centerName || 'مركز دعم تعليمي';

  const enrollments = parseSubjects(student.subject);
  const discount = student.discount || 0;

  const SHORT_DAYS: { [key: string]: string } = {
    'Monday': 'Mon', 'Tuesday': 'Tue', 'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat', 'Sunday': 'Sun'
  };

  const formatSchedule = (scheduleRaw?: string): string => {
    if (!scheduleRaw) return '';
    try {
      const schedule = JSON.parse(scheduleRaw);
      if (!Array.isArray(schedule)) return '';
      return schedule.map((s: any) => `${SHORT_DAYS[s.day] || s.day}: ${s.start}-${s.end}`).join(' | ');
    } catch {
      return '';
    }
  };

  // Calculate financials
  let subtotal = 0;
  const subjectRows = enrollments.map(e => {
    const price = e.price || 0;
    subtotal += price;
    const scheduleStr = formatSchedule(e.schedule);
    return `
      <tr>
        <td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 11px;">
          <div style="font-weight: bold;">${e.subject}</div>
          ${scheduleStr ? `<div style="font-size: 9px; color: #6b7280; font-weight: normal; margin-top: 2px;">${scheduleStr}</div>` : ''}
        </td>
        <td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 11px;">${e.level || student.level}</td>
        <td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; color: #4b5563; font-size: 11px;">${e.teacherName || '-'}</td>
        <td style="padding: 4px 6px; border-bottom: 1px solid #e5e7eb; text-align: left; color: #111827; font-weight: bold; font-size: 11px;">${price} MAD</td>
      </tr>
    `;
  }).join('');

  const total = Math.max(0, subtotal - discount);

  element.innerHTML = `
    <div style="
      position: relative;
      background: #fdfdfd;
      padding: 15px;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: 2px double #1f2937;
    ">

       <!-- Watermark -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-10deg);
        font-size: 50px;
        color: rgba(0, 0, 0, 0.015);
        font-weight: bold;
        z-index: 0;
        pointer-events: none;
        white-space: nowrap;
      ">
        ${displayCenterName}
      </div>

      <div style="position: relative; z-index: 1;">

        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <div style="text-align: right;">
            <h1 style="margin: 0; color: #111827; font-size: 16px; font-weight: 800;">${displayCenterName}</h1>
            <p style="margin: 1px 0 0 0; color: #4b5563; font-size: 9px;">حرر بتاريخ: <span dir="ltr">${date}</span></p>
          </div>
          <div style="text-align: left; opacity: 0.8;">
             <h2 style="margin: 0; color: #4f46e5; font-size: 12px; font-weight: bold;">SoutienFlow</h2>
             <span style="font-size: 6px; color: #6b7280; text-transform: uppercase;">System Provider</span>
          </div>
        </div>

        <!-- Title -->
        <div style="display: flex; justify-content: center; margin-bottom: 6px;">
          <div style="
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            color: #111827;
            padding: 3px 15px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          ">
            وصل تسجيل وتفصيل الرسوم
          </div>
        </div>

        <!-- Info Grid -->
        <div style="margin-bottom: 6px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <tr>
               <td style="padding: 1px 0; color: #6b7280; width: 80px;">الاسم الكامل:</td>
               <td style="padding: 1px 0; font-weight: bold; color: #111827; text-align: left;">${studentName}</td>
            </tr>
             <tr>
               <td style="padding: 1px 0; color: #6b7280;">المستوى:</td>
               <td style="padding: 1px 0; font-weight: bold; color: #111827; text-align: left;">${student.level}</td>
            </tr>
          </table>
        </div>

        <!-- Financial Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 9px; border: 1px solid #e5e7eb;">
          <thead>
            <tr style="background: #f9fafb; text-align: right;">
               <th style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 8px;">المادة</th>
               <th style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 8px;">المستوى</th>
               <th style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 8px;">الأستاذ</th>
               <th style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: left; font-size: 8px;">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${enrollments.map(e => {
    const scheduleStr = formatSchedule(e.schedule);
    return `
              <tr>
                <td style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #111827;">
                  <div style="font-weight: bold; font-size: 9px;">${e.subject}</div>
                  ${scheduleStr ? `<div style="font-size: 7.5px; color: #6b7280; font-weight: normal; margin-top: 1px;">${scheduleStr}</div>` : ''}
                </td>
                <td style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${e.level || student.level}</td>
                <td style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; color: #4b5563;">${e.teacherName || '-'}</td>
                <td style="padding: 2px 4px; border-bottom: 1px solid #e5e7eb; text-align: left; color: #111827; font-weight: 500;">${e.price || 0} MAD</td>
              </tr>
            `;
  }).join('')}

            <!-- Subtotal Row -->
            <tr style="background: #f9fafb;">
              <td colspan="3" style="padding: 2px 4px; border-top: 1px solid #e5e7eb; font-weight: bold; color: #374151;">المجموع الفرعي</td>
              <td style="padding: 2px 4px; border-top: 1px solid #e5e7eb; text-align: left; font-weight: bold; color: #374151;">${subtotal} MAD</td>
            </tr>

            <!-- Discount Row -->
            ${discount > 0 ? `
            <tr style="background: #fffbeb;">
              <td colspan="3" style="padding: 2px 4px; border-top: 1px solid #e5e7eb; font-weight: bold; color: #92400e;">الخصم</td>
              <td style="padding: 2px 4px; border-top: 1px solid #e5e7eb; text-align: left; font-weight: bold; color: #92400e;">- ${discount} MAD</td>
            </tr>` : ''}

            <!-- Total Row -->
            <tr style="background: #f0fdf4;">
              <td colspan="3" style="padding: 3px 5px; border-top: 2px solid #e5e7eb; font-size: 10px; font-weight: 800; color: #166534;">المجموع الكلي</td>
              <td style="padding: 3px 5px; border-top: 2px solid #e5e7eb; text-align: left; font-size: 10px; font-weight: 800; color: #166534;">${total} MAD</td>
            </tr>
          </tbody>
        </table>

        <!-- Confirmation & Signature -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1px;">
           <div style="font-size: 8px; color: #4b5563; line-height: 1.2; max-width: 60%; text-align: right;">
             نشهد أن التلميذ(ة) قد أدى واجبات التسجيل للمواد المذكورة.
           </div>
           <div style="text-align: center; width: 110px;">
             <p style="margin: 0; font-weight: bold; color: #111827; border-bottom: 1px solid #e5e7eb; padding-bottom: 1px; display: inline-block; font-size: 8px;">توقيع وختم الإدارة</p>
           </div>
        </div>

      </div>

      <!-- Footer -->
      <div style="
        position: absolute;
        bottom: 2px;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 5.5px;
        color: #9ca3af;
      ">
        Generated by SoutienFlow System
      </div>

    </div>
  `;

  const opt = {
    margin: [5, 5, 5, 5],
    filename: `receipt_${studentName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.95 } as const,
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } as const
  };

  html2pdf().from(element).set(opt).save();
};
