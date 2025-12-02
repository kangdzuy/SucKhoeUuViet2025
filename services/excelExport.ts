import { GeneralInfo, InsuranceGroup, CalculationResult, ContractType } from '../types';

export const exportToExcel = (
  info: GeneralInfo, 
  groups: InsuranceGroup[], 
  result: CalculationResult
) => {
  const fileName = `Bao_Gia_${info.tenKhachHang ? info.tenKhachHang.replace(/[^a-z0-9]/gi, '_') : 'Khach_Hang'}_${new Date().toISOString().slice(0,10)}.xls`;

  const fmt = (val: number | undefined | null) => {
    if (val === undefined || val === null || val === 0) return '-';
    return new Intl.NumberFormat('vi-VN').format(Math.round(val));
  };

  // Helper to check if a benefit is selected to show meaningful data or empty
  const getCellData = (
    isSelected: boolean, 
    si: number, 
    premium: number
  ) => {
    if (!isSelected) return { si: '', prem: '' };
    return { si: fmt(si), prem: fmt(premium) };
  };

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Bảng Phí Chi Tiết</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
                <x:FrozenNoSplit/>
                <x:SplitHorizontal>6</x:SplitHorizontal>
                <x:TopRowBottomPane>6</x:TopRowBottomPane>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: 'Times New Roman', Arial, sans-serif; font-size: 11pt; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 0.5pt solid #999; padding: 5px; vertical-align: middle; }
        
        /* Headers */
        .header-title { font-size: 18pt; font-weight: bold; border: none; text-align: center; color: #00529B; padding: 20px; }
        .section-header { background-color: #00529B; color: white; font-weight: bold; text-align: center; white-space: nowrap; }
        .sub-header { background-color: #f0f4f8; color: #333; font-weight: bold; text-align: center; font-size: 10pt; }
        
        /* Data Cells */
        .group-name { font-weight: bold; text-align: left; background-color: #fafafa; }
        .center { text-align: center; }
        .number { text-align: right; mso-number-format:"\#\,\#\#0"; }
        
        /* Summary Section */
        .summary-label { font-weight: bold; background-color: #e6e6e6; }
        .total-row { background-color: #FFFFCC; font-weight: bold; border-top: 2pt double #333; }
        .final-prem { background-color: #F58220; color: white; font-weight: bold; font-size: 14pt; }
        
        /* Benefit Column Colors */
        .bg-main { background-color: #e3f2fd; }
        .bg-sub { background-color: #fff3e0; }
      </style>
    </head>
    <body>
      <table>
        <!-- Title -->
        <tr>
            <td colspan="23" class="header-title">BẢNG TÍNH PHÍ BẢO HIỂM SỨC KHỎE ƯU VIỆT 2025</td>
        </tr>
        <tr><td colspan="23" style="border:none;"></td></tr>
        
        <!-- General Info -->
        <tr>
            <td colspan="3" class="summary-label">Tên Khách Hàng:</td>
            <td colspan="8" style="font-weight: bold;">${info.tenKhachHang}</td>
            <td colspan="3" class="summary-label">Ngày báo giá:</td>
            <td colspan="9">${new Date().toLocaleDateString('vi-VN')}</td>
        </tr>
        <tr>
            <td colspan="3" class="summary-label">Loại Hợp Đồng:</td>
            <td colspan="2">${info.loaiHopDong === ContractType.NHOM ? 'Nhóm' : 'Cá nhân'}</td>
            <td colspan="2" class="summary-label">Phạm Vi:</td>
            <td colspan="4">${info.phamViDiaLy}</td>
            <td colspan="2" class="summary-label">Thời Hạn:</td>
            <td colspan="10">${info.thoiHanBaoHiem}</td>
        </tr>
        <tr><td colspan="23" style="border:none;"></td></tr>

        <!-- Table Header -->
        <thead>
          <tr>
              <th rowspan="2" class="section-header">STT</th>
              <th rowspan="2" class="section-header" style="width: 200px;">Tên Nhóm / Cá Nhân</th>
              <th rowspan="2" class="section-header">Số Người</th>
              <th rowspan="2" class="section-header">Tuổi TB</th>
              
              <!-- Main Benefits -->
              <th colspan="2" class="section-header" style="background-color: #1565C0;">A. Tai Nạn</th>
              <th colspan="2" class="section-header" style="background-color: #1565C0;">B. Tử Vong (Bệnh)</th>
              <th colspan="2" class="section-header" style="background-color: #1565C0;">C. Nội Trú</th>
              
              <!-- Sub Benefits -->
              <th colspan="2" class="section-header" style="background-color: #EF6C00;">D. Thai Sản</th>
              <th colspan="2" class="section-header" style="background-color: #EF6C00;">E. Ngoại Trú</th>
              <th colspan="2" class="section-header" style="background-color: #EF6C00;">F. Nha Khoa</th>
              <th colspan="2" class="section-header" style="background-color: #EF6C00;">G. Nước Ngoài</th>
              <th colspan="2" class="section-header" style="background-color: #EF6C00;">H. Trợ Cấp TN</th>
              <th colspan="2" class="section-header" style="background-color: #EF6C00;">I. Ngộ Độc</th>
              
              <th rowspan="2" class="section-header" style="background-color: #333;">Tổng Phí Gốc</th>
          </tr>
          <tr>
              <!-- Sub Headers for SI & Premium -->
              <th class="sub-header bg-main">STBH</th> <th class="sub-header bg-main">Phí</th>
              <th class="sub-header bg-main">STBH</th> <th class="sub-header bg-main">Phí</th>
              <th class="sub-header bg-main">Hạn Mức</th> <th class="sub-header bg-main">Phí</th>
              
              <th class="sub-header bg-sub">STBH</th> <th class="sub-header bg-sub">Phí</th>
              <th class="sub-header bg-sub">Hạn Mức</th> <th class="sub-header bg-sub">Phí</th>
              <th class="sub-header bg-sub">Hạn Mức</th> <th class="sub-header bg-sub">Phí</th>
              <th class="sub-header bg-sub">Hạn Mức</th> <th class="sub-header bg-sub">Phí</th>
              <th class="sub-header bg-sub">STBH</th> <th class="sub-header bg-sub">Phí</th>
              <th class="sub-header bg-sub">STBH</th> <th class="sub-header bg-sub">Phí</th>
          </tr>
        </thead>
        
        <tbody>
        ${groups.map((g, index) => {
            // Find calculated details
            const rGroup = result.detailByGroup.find(r => r.id === g.id);
            const d = rGroup?.details || {};

            // Calculate aggregated premiums for A (Main + Subs)
            const premA = (d['A_Chinh'] || 0) + (d['A_TroCap'] || 0) + (d['A_YTe'] || 0);
            
            // Prepare Data Cells
            const dataA = getCellData(g.chonQuyenLoiA, g.stbhA, premA);
            const dataB = getCellData(g.chonQuyenLoiB, g.stbhB, d['B'] || 0);
            const dataC = getCellData(g.chonQuyenLoiC, g.stbhC, d['C'] || 0);
            const dataD = getCellData(g.chonQuyenLoiD, g.stbhD, d['D'] || 0);
            const dataE = getCellData(g.chonQuyenLoiE, g.stbhE, d['E'] || 0);
            const dataF = getCellData(g.chonQuyenLoiF, g.stbhF, d['F'] || 0);
            const dataG = getCellData(g.chonQuyenLoiG, g.stbhG, d['G'] || 0); // G usually follows C limit in UI logic if complex, but here simplistic
            const dataH = getCellData(g.chonQuyenLoiH, g.stbhH, d['H'] || 0);
            const dataI = getCellData(g.chonQuyenLoiI, g.stbhI, d['I'] || 0);

            return `
            <tr>
                <td class="center">${index + 1}</td>
                <td class="group-name">${g.tenNhom}</td>
                <td class="center">${g.soNguoi}</td>
                <td class="center">${g.tuoiTrungBinh}</td>
                
                <td class="number bg-main">${dataA.si}</td> <td class="number bg-main">${dataA.prem}</td>
                <td class="number bg-main">${dataB.si}</td> <td class="number bg-main">${dataB.prem}</td>
                <td class="number bg-main">${dataC.si}</td> <td class="number bg-main">${dataC.prem}</td>
                
                <td class="number bg-sub">${dataD.si}</td> <td class="number bg-sub">${dataD.prem}</td>
                <td class="number bg-sub">${dataE.si}</td> <td class="number bg-sub">${dataE.prem}</td>
                <td class="number bg-sub">${dataF.si}</td> <td class="number bg-sub">${dataF.prem}</td>
                <td class="number bg-sub">${dataC.si /* G uses C limit typically, displaying C limit for ref or - */ }</td> <td class="number bg-sub">${dataG.prem}</td>
                <td class="number bg-sub">${dataH.si}</td> <td class="number bg-sub">${dataH.prem}</td>
                <td class="number bg-sub">${dataI.si}</td> <td class="number bg-sub">${dataI.prem}</td>
                
                <td class="number" style="font-weight:bold;">${fmt(rGroup?.tongPhiGoc || 0)}</td>
            </tr>
            `;
        }).join('')}
        
        <!-- Total Row -->
        <tr class="total-row">
            <td colspan="2" class="center">TỔNG CỘNG</td>
            <td class="center">${result.tongSoNguoi}</td>
            <td></td>
            <!-- Empty cells for detail columns, just span or leave blank -->
            <td colspan="18"></td>
            <td class="number">${fmt(result.tongPhiGoc)}</td>
        </tr>
        </tbody>
      </table>

      <br/>

      <!-- Summary Calculation Section (Small Table below) -->
      <table style="width: 50%; margin-top: 20px;">
        <tr>
            <td colspan="2" class="section-header" style="text-align: left; padding-left: 10px;">TỔNG HỢP PHÍ CUỐI CÙNG</td>
        </tr>
        <tr>
            <td class="summary-label">1. Tổng Phí Gốc</td>
            <td class="number">${fmt(result.tongPhiGoc)}</td>
        </tr>
        <tr>
            <td class="summary-label">2. Hệ số thời hạn (${info.thoiHanBaoHiem})</td>
            <td class="number">x ${result.heSoThoiHan}</td>
        </tr>
        <tr>
            <td class="summary-label">3. Giảm phí đồng chi trả (Co-pay: ${info.mucDongChiTra})</td>
            <td class="number">x ${result.heSoDongChiTra}</td>
        </tr>
        <tr>
            <td class="summary-label">4. Giảm phí quy mô nhóm</td>
            <td class="number">x ${result.heSoGiamNhom}</td>
        </tr>
        ${result.heSoTangLR !== 1 || result.heSoGiamLR !== 1 ? `
        <tr>
            <td class="summary-label">5. Điều chỉnh Loss Ratio (Tái tục)</td>
            <td class="number">x ${(result.heSoTangLR * result.heSoGiamLR).toFixed(2)}</td>
        </tr>` : ''}
        
        <tr class="final-row">
            <td>PHÍ THANH TOÁN</td>
            <td class="number">${fmt(result.phiCuoi)}</td>
        </tr>
        ${result.isFloorApplied ? `
        <tr>
            <td colspan="2" style="color: red; font-size: 9pt; font-style: italic;">
                * Phí đã được điều chỉnh lên mức Phí Thuần Tối Thiểu (Floor Rate) theo quy định.
            </td>
        </tr>` : ''}
      </table>

      <div style="margin-top: 20px; font-size: 10pt; color: #666;">
        <p><i>Ghi chú:</i></p>
        <ul style="margin: 0; padding-left: 20px;">
            <li>Đơn vị tính: VNĐ</li>
            <li>Bảng phí này chỉ có giá trị tham khảo. Phí thực tế có thể thay đổi tùy thuộc vào quy tắc thẩm định cuối cùng.</li>
        </ul>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};