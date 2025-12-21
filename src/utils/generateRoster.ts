// @ts-ignore
import html2pdf from 'html2pdf.js/dist/html2pdf.bundle.min.js';
import { Student, Class } from '../../types';

export const generateRosterPDF = (cls: Class, students: Student[], centerName: string) => {
    const element = document.createElement('div');
    element.style.width = '100%';
    element.style.padding = '20px';
    element.style.fontFamily = "'Tajawal', 'Segoe UI', 'Arial', sans-serif";
    element.dir = 'rtl';

    const date = new Date().toLocaleDateString('fr-FR');
    const displayCenterName = centerName || 'مركز دعم تعليمي';

    element.innerHTML = `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: white;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 15px;">
        <div style="text-align: right;">
          <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800;">${displayCenterName}</h1>
          <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">لائحة تلاميذ القسم</p>
        </div>
        <div style="text-align: left;">
          <p style="margin: 0; color: #4b5563; font-size: 11px;">التاريخ: <span dir="ltr">${date}</span></p>
          <p style="margin: 3px 0 0 0; color: #6b7280; font-size: 10px;">SoutienFlow System</p>
        </div>
      </div>

      <!-- Class Info Hub -->
      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 25px; background: #f9fafb; padding: 15px; border-radius: 8px;">
        <div>
          <span style="color: #6b7280; font-size: 11px; display: block; margin-bottom: 2px;">اسم القسم:</span>
          <span style="font-weight: bold; color: #111827; font-size: 16px;">${cls.class_name}</span>
        </div>
        <div style="text-align: left;">
          <span style="color: #6b7280; font-size: 11px; display: block; margin-bottom: 2px;">المستوى والمادة:</span>
          <span style="font-weight: bold; color: #4f46e5; font-size: 14px;">${cls.level} - ${cls.subject}</span>
        </div>
      </div>

      <!-- Data Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #4f46e5; color: white;">
            <th style="padding: 12px 15px; text-align: right; font-size: 12px; border-radius: 8px 0 0 0;">اسم التلميذ</th>
            <th style="padding: 12px 15px; text-align: right; font-size: 12px;">المستوى</th>
            <th style="padding: 12px 15px; text-align: center; font-size: 12px;">تاريخ التسجيل</th>
            <th style="padding: 12px 15px; text-align: center; font-size: 12px; border-radius: 0 8px 0 0;">الوقت</th>
          </tr>
        </thead>
        <tbody>
          ${students.length > 0 ? students.map((student, index) => `
            <tr style="background: ${index % 2 === 0 ? '#fff' : '#f9fafb'};">
              <td style="padding: 10px 15px; border-bottom: 1px solid #f3f4f6; color: #111827; font-weight: 500; font-size: 12px;">${student.full_name || student.name}</td>
              <td style="padding: 10px 15px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 11px;">${student.level}</td>
              <td style="padding: 10px 15px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 11px; text-align: center;">${student.created_at ? new Date(student.created_at).toLocaleDateString('fr-FR') : 'N/A'}</td>
              <td style="padding: 10px 15px; border-bottom: 1px solid #f3f4f6; color: #4b5563; font-size: 11px; text-align: center;">${student.created_at ? new Date(student.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</td>
            </tr>
          `).join('') : `
            <tr>
              <td colspan="4" style="padding: 40px; text-align: center; color: #9ca3af; font-style: italic;">لا يوجد تلاميذ مسجلين في هذا القسم</td>
            </tr>
          `}
        </tbody>
      </table>

      <!-- Footer Info -->
      <div style="margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #f3f4f6; pt: 15px;">
        <div style="font-size: 10px; color: #9ca3af;">
          عدد التلاميذ الإجمالي: ${students.length}
        </div>
        <div style="font-size: 10px; color: #9ca3af;">
          تم استخراج هاته اللائحة عبر نظام SoutienFlow
        </div>
      </div>
    </div>
  `;

    const opt = {
        margin: [10, 10, 10, 10],
        filename: `لائحة_${cls.class_name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
};
