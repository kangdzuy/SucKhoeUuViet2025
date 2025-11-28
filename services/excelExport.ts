import { GeneralInfo, InsuranceGroup, CalculationResult, ContractType } from '../types';

export const exportToExcel = (
  info: GeneralInfo, 
  groups: InsuranceGroup[], 
  result: CalculationResult
) => {
  const fileName = `Bao_Gia_${info.tenKhachHang ? info.tenKhachHang.replace(/[^a-z0-9]/gi, '_') : 'Khach_Hang'}_${new Date().toISOString().slice(0,10)}.xls`;

  // Helper to safely format numbers for Excel display (as text to avoid localization issues in simple HTML mode)
  // or keep raw for calculations if needed. Here we use text for display clarity.
  const fmt = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Bảng Tính Phí</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 0.5pt solid #999; padding: 5px; vertical-align: middle; }
        th { background-color: #00529B; color: white; font-weight: bold; text-align: center; }
        .header-title { font-size: 18px; font-weight: bold; border: none; text-align: center; color: #00529B; padding: 15px; }
        .group-header { background-color: #f0f0f0; font-weight: bold; color: #333; }
        .label { font-weight: bold; background-color: #e6e6e6; }
        .number { text-align: right; mso-number-format:"\#\,\#\#0"; }
        .center { text-align: center; }
        .total-row { background-color: #FFFFCC; font-weight: bold; }
        .final-row { background-color: #F58220; color: white; font-weight: bold; font-size: 14px; }
      </style>
    </head>
    <body>
      <table>
        <tr>
            <td colspan="6" class="header-title">BẢNG TÍNH PHÍ BẢO HIỂM SỨC KHỎE ƯU VIỆT 2025</td>
        </tr>
        <tr><td></td></tr>
        
        <!-- General Info Section -->
        <tr>
            <td class="label">Tên Khách Hàng:</td>
            <td colspan="5" style="font-weight: bold;">${info.tenKhachHang}</td>
        </tr>
        <tr>
            <td class="label">Loại Hợp Đồng:</td>
            <td>${info.loaiHopDong === ContractType.NHOM ? 'Nhóm' : 'Cá nhân'}</td>
            <td class="label">Phạm Vi Địa Lý:</td>
            <td>${info.phamViDiaLy}</td>
            <td class="label">Thời Hạn:</td>
            <td>${info.thoiHanBaoHiem}</td>
        </tr>
        <tr>
            <td class="label">Mức Đồng Chi Trả:</td>
            <td>${info.mucDongChiTra}</td>
            <td class="label">Tỷ lệ bồi thường năm trước:</td>
            <td>${info.tyLeBoiThuongNamTruoc}%</td>
            <td></td><td></td>
        </tr>
        <tr><td></td></tr>

        <!-- Details Table -->
        <tr>
            <th>STT</th>
            <th>Tên Nhóm / Cá Nhân</th>
            <th>Số Người</th>
            <th>Tuổi TB</th>
            <th>Tổng Phí Gốc (VND)</th>
            <th>Phí Thuần Min (VND)</th>
        </tr>
        
        ${result.detailByGroup.map((g, index) => `
        <tr>
            <td class="center">${index + 1}</td>
            <td>${g.tenNhom}</td>
            <td class="center">${g.soNguoi}</td>
            <td class="center">${g.tuoiTrungBinh}</td>
            <td class="number">${g.tongPhiGoc}</td>
            <td class="number">${g.tongPhiThuanToiThieu}</td>
        </tr>
        `).join('')}

        <!-- Group Totals -->
        <tr class="total-row">
            <td colspan="2" class="center">TỔNG CỘNG</td>
            <td class="center">${result.tongSoNguoi}</td>
            <td></td>
            <td class="number">${result.tongPhiGoc}</td>
            <td class="number">${result.tongPhiThuanToiThieu}</td>
        </tr>
        <tr><td></td></tr>

        <!-- Summary Calculation Section -->
        <tr>
            <td colspan="4" class="group-header" style="border: none; font-size: 14px; padding-top: 10px;">TỔNG HỢP TÍNH PHÍ</td>
        </tr>
        <tr>
            <td colspan="3" class="label">1. Tổng Phí Gốc (Base Premium)</td>
            <td class="number">${result.tongPhiGoc}</td>
        </tr>
        <tr>
            <td colspan="3">2. Hệ số thời hạn</td>
            <td class="number">x ${result.heSoThoiHan}</td>
        </tr>
        <tr>
            <td colspan="3" class="label">   => Phí sau thời hạn</td>
            <td class="number">${result.phiSauThoiHan}</td>
        </tr>
        <tr>
            <td colspan="3">3. Hệ số đồng chi trả (Co-pay discount)</td>
            <td class="number">x ${result.heSoDongChiTra}</td>
        </tr>
        <tr>
            <td colspan="3">4. Hệ số giảm phí quy mô nhóm</td>
            <td class="number">x ${result.heSoGiamNhom}</td>
        </tr>
        <tr>
            <td colspan="3">5. Điều chỉnh Loss Ratio (Tăng/Giảm)</td>
            <td class="number">x ${(result.heSoTangLR * result.heSoGiamLR).toFixed(2)}</td>
        </tr>
        
        <tr class="total-row">
            <td colspan="3">PHÍ THƯƠNG MẠI SƠ BỘ (Commercial Premium)</td>
            <td class="number">${Math.round(result.phiSauLR)}</td>
        </tr>

        <tr>
            <td colspan="3" style="color: #666; font-style: italic;">Sàn Phí Thuần (Min Pure Premium - Tham khảo)</td>
            <td class="number" style="color: #666;">${Math.round(result.phiThuanSauHeSo)}</td>
        </tr>

        <tr class="final-row">
            <td colspan="3">PHÍ CUỐI CÙNG (FINAL PREMIUM)</td>
            <td class="number">${Math.round(result.phiCuoi)}</td>
        </tr>
        ${result.isFloorApplied ? `
        <tr>
            <td colspan="4" style="color: red; font-style: italic;">* Lưu ý: Phí đã được điều chỉnh bằng mức Phí Thuần Tối Thiểu do phí tính toán thấp hơn sàn quy định.</td>
        </tr>` : ''}
      </table>
      <br/>
      <div style="font-size: 11px; color: #888;">Được xuất từ hệ thống Tính Phí Bảo Hiểm Sức Khỏe Ưu Việt - Phú Hưng Assurance</div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  
  // Create hidden link and click it
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};