import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDFReport = async (reportData: any, reportType: 'daily' | 'monthly') => {
  // Create a temporary div with the report content
  const reportElement = document.createElement('div');
  reportElement.style.cssText = `
    position: absolute;
    top: -9999px;
    left: -9999px;
    width: 800px;
    padding: 40px;
    background: white;
    font-family: Arial, sans-serif;
    direction: rtl;
    text-align: right;
  `;

  const title = reportType === 'daily' ? 'تقرير يومي' : 'تقرير شهري';
  const currentDate = new Date().toLocaleDateString('en-GB');

  reportElement.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 28px; color: #059669; margin-bottom: 10px;">نظام إدارة المطعم</h1>
      <h2 style="font-size: 22px; color: #374151; margin-bottom: 5px;">${title}</h2>
      <p style="font-size: 14px; color: #6B7280;">التاريخ: ${currentDate}</p>
      <hr style="border: 1px solid #D1D5DB; margin: 20px 0;">
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #059669; padding-bottom: 5px;">الملخص المالي</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr style="background-color: #F3F4F6;">
          <td style="padding: 12px; border: 1px solid #D1D5DB; font-weight: bold;">البيان</td>
          <td style="padding: 12px; border: 1px solid #D1D5DB; font-weight: bold;">المبلغ (دج)</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #D1D5DB;">المبيعات</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; color: #059669; font-weight: bold;">${reportData.sales.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #F9FAFB;">
          <td style="padding: 10px; border: 1px solid #D1D5DB;">المشتريات</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; color: #2563EB; font-weight: bold;">${reportData.purchases.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #D1D5DB;">المصروفات</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; color: #DC2626; font-weight: bold;">${reportData.expenses.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #F3F4F6; font-weight: bold;">
          <td style="padding: 12px; border: 1px solid #D1D5DB;">صافي الربح</td>
          <td style="padding: 12px; border: 1px solid #D1D5DB; color: ${reportData.netProfit >= 0 ? '#059669' : '#DC2626'}; font-size: 16px;">${reportData.netProfit.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 18px; color: #374151; margin-bottom: 15px; border-bottom: 2px solid #059669; padding-bottom: 5px;">تفاصيل المعاملات</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #F3F4F6;">
          <td style="padding: 10px; border: 1px solid #D1D5DB; font-weight: bold; width: 8%;">#</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; font-weight: bold; width: 40%;">الوصف</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; font-weight: bold; width: 15%;">النوع</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; font-weight: bold; width: 20%;">المبلغ (دج)</td>
          <td style="padding: 10px; border: 1px solid #D1D5DB; font-weight: bold; width: 17%;">التاريخ</td>
        </tr>
        ${reportData.transactions.map((transaction: any, index: number) => {
          const transactionType = transaction.type === 'sale' ? 'مبيعات' : 
                                 transaction.type === 'purchase' ? 'مشتريات' : 'مصروفات';
          const typeColor = transaction.type === 'sale' ? '#059669' : 
                           transaction.type === 'purchase' ? '#2563EB' : '#DC2626';
          const bgColor = index % 2 === 0 ? '#F9FAFB' : 'white';
          
          return `
            <tr style="background-color: ${bgColor};">
              <td style="padding: 8px; border: 1px solid #D1D5DB; text-align: center;">${index + 1}</td>
              <td style="padding: 8px; border: 1px solid #D1D5DB;">${transaction.description}</td>
              <td style="padding: 8px; border: 1px solid #D1D5DB; color: ${typeColor}; font-weight: bold;">${transactionType}</td>
              <td style="padding: 8px; border: 1px solid #D1D5DB; font-weight: bold;">${transaction.amount.toLocaleString()}</td>
              <td style="padding: 8px; border: 1px solid #D1D5DB;">${new Date(transaction.date).toLocaleDateString('en-GB')}</td>
            </tr>
          `;
        }).join('')}
      </table>
    </div>

    <div style="margin-top: 40px; text-align: center; border-top: 1px solid #D1D5DB; padding-top: 20px;">
      <p style="font-size: 12px; color: #6B7280;">تم إنشاء هذا التقرير بواسطة نظام إدارة المطعم</p>
      <p style="font-size: 12px; color: #6B7280;">تاريخ الطباعة: ${new Date().toLocaleString('en-GB')}</p>
    </div>
  `;

  document.body.appendChild(reportElement);

  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: reportElement.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; 
    const pageHeight = 295; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${title}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('حدث خطأ في إنشاء ملف PDF');
  } finally {
    document.body.removeChild(reportElement);
  }
};