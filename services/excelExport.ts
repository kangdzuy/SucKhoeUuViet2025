import { GeneralInfo, InsuranceGroup, CalculationResult, ContractType, BenefitAMethod, BenefitHMethod, BenefitASalaryOption, Gender } from '../types';
import { DURATION_FACTORS, getBaseRate } from '../constants';

// Helper to escape XML characters
const esc = (str: string | number | undefined) => {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Helper to create a cell
const Cell = (value: string | number, styleID?: string, type?: 'String' | 'Number') => {
  const cellType = type || (typeof value === 'number' ? 'Number' : 'String');
  const styleAttr = styleID ? ` ss:StyleID="${styleID}"` : '';
  return `<Cell${styleAttr}><Data ss:Type="${cellType}">${esc(value)}</Data></Cell>`;
};

// Helper to create a row
const Row = (cells: string[]) => {
  return `<Row>${cells.join('')}</Row>`;
};

export const exportToExcel = (
  info: GeneralInfo, 
  groups: InsuranceGroup[], 
  result: CalculationResult
) => {
  const fileName = `Bao_Gia_${info.tenKhachHang ? info.tenKhachHang.replace(/[^a-z0-9]/gi, '_') : 'Khach_Hang'}_${new Date().toISOString().slice(0,10)}.xls`;
  const createdDate = new Date().toISOString();
  
  // Calculate common factors
  const durationFactor = DURATION_FACTORS[info.thoiHanBaoHiem] || 1;

  // --- SHEET 1: SUMMARY ---
  let sheet1Rows = '';
  // Headers
  sheet1Rows += Row([
    Cell('Tên báo giá', 'sHeader'),
    Cell('Ngày tạo', 'sHeader'),
    Cell('Sản phẩm', 'sHeader'),
    Cell('Cá nhân / Nhóm', 'sHeader'),
    Cell('Số người', 'sHeader'),
    Cell('Phạm vi', 'sHeader'),
    Cell('Thời hạn', 'sHeader'),
    Cell('Tổng phí trước giảm giá', 'sHeader'),
    Cell('Tổng tăng/giảm (LR/Size)', 'sHeader'),
    Cell('Phí cuối', 'sHeader'),
    Cell('Phí thuần (Floor)', 'sHeader')
  ]);

  // Data Row
  const diffFactor = (result.heSoGiamNhom * result.heSoTangLR * result.heSoGiamLR * result.heSoDongChiTra) - 1; // Simplified view of impact
  
  sheet1Rows += Row([
    Cell(info.tenKhachHang),
    Cell(new Date().toLocaleDateString('vi-VN')),
    Cell('HEA 2025 - Ưu Việt'),
    Cell(info.loaiHopDong === ContractType.NHOM ? 'Nhóm' : 'Cá nhân'),
    Cell(result.tongSoNguoi, 'sNumber'),
    Cell(info.phamViDiaLy),
    Cell(info.thoiHanBaoHiem),
    Cell(result.phiSauThoiHan, 'sCurrency'), // Base * Duration
    Cell(diffFactor, 'sPercent'),
    Cell(result.phiCuoi, 'sCurrencyBold'),
    Cell(result.phiThuanSauHeSo, 'sCurrency')
  ]);

  // --- SHEET 2: INPUT ---
  let sheet2Rows = '';
  sheet2Rows += Row([
    Cell('Họ tên / Tên nhóm', 'sHeader'),
    Cell('Tuổi TB', 'sHeader'),
    Cell('Giới tính (Đại diện)', 'sHeader'),
    Cell('Số lượng', 'sHeader'),
    Cell('Phạm vi', 'sHeader'),
    Cell('Thời hạn', 'sHeader'),
    Cell('Đồng chi trả', 'sHeader'),
    Cell('Loss Ratio (Năm trước)', 'sHeader')
  ]);

  groups.forEach(g => {
    sheet2Rows += Row([
      Cell(g.tenNhom),
      Cell(g.tuoiTrungBinh, 'sNumber'),
      Cell(g.gioiTinh || 'N/A'),
      Cell(g.soNguoi, 'sNumber'),
      Cell(info.phamViDiaLy),
      Cell(info.thoiHanBaoHiem),
      Cell(info.mucDongChiTra),
      Cell(info.tyLeBoiThuongNamTruoc, 'sNumber')
    ]);
  });

  // --- SHEET 3: BENEFIT DETAIL ---
  let sheet3Rows = '';
  sheet3Rows += Row([
    Cell('Tên Nhóm', 'sHeader'),
    Cell('Mã QL', 'sHeader'),
    Cell('Tên quyền lợi', 'sHeader'),
    Cell('STBH (Hạn mức)', 'sHeader'),
    Cell('Tỷ lệ phí (%)', 'sHeader'),
    Cell('Hệ số thời hạn', 'sHeader'),
    Cell('Phí quyền lợi con (Trước CK)', 'sHeader'),
    Cell('Phụ thuộc', 'sHeader'),
    Cell('Trạng thái', 'sHeader')
  ]);

  groups.forEach(g => {
    const age = g.tuoiTrungBinh;
    const geo = info.phamViDiaLy;

    // Helper to generate benefit row with SPECIFIC COUNT logic
    const addBenRow = (code: string, name: string, selected: boolean, si: number, dep: string, method?: string, extra?: any, specificCount?: number) => {
       const status = selected ? 'ON' : 'OFF';
       let rate = 0;
       let fee = 0;
       
       if (selected && si > 0) {
           rate = getBaseRate(code, age, geo, si, extra);
           // Calculate TOTAL fee for the group/individual for this benefit line
           const countToUse = specificCount !== undefined ? specificCount : g.soNguoi;
           fee = si * rate * durationFactor * countToUse;
       }

       // Format Code for display (A_MAIN -> A1)
       let displayCode = code;
       if (code === 'A_MAIN') displayCode = 'A1';
       if (code === 'A_ALLOWANCE') displayCode = 'A2';
       if (code === 'A_MEDICAL') displayCode = 'A3';

       sheet3Rows += Row([
         Cell(g.tenNhom),
         Cell(displayCode),
         Cell(name),
         Cell(si, 'sNumber'),
         Cell(rate, 'sPercent'),
         Cell(durationFactor, 'sNumber'),
         Cell(fee, 'sCurrency'),
         Cell(dep),
         Cell(status)
       ]);
    };

    // A Main
    let siA = g.stbhA;
    if (g.methodA === BenefitAMethod.THEO_LUONG) siA = (g.luongA || 0) * (g.soThangLuongA || 0);
    addBenRow('A_MAIN', 'Tai nạn (Chính)', g.chonQuyenLoiA, siA, '-');

    // A Sub 1
    let siA1 = 0;
    if (g.subA_TroCap_Option === BenefitASalaryOption.OP_3_5) siA1 = (g.luongA || 0) * 5;
    if (g.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) siA1 = (g.luongA || 0) * 9;
    if (g.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) siA1 = (g.luongA || 0) * 12;
    addBenRow('A_ALLOWANCE', 'Trợ cấp lương (Tai nạn)', g.subA_TroCap, siA1, 'A', undefined, { option: g.subA_TroCap_Option });

    // A Sub 2
    addBenRow('A_MEDICAL', 'Y tế (Tai nạn)', g.subA_YTe, g.stbhA_YTe, 'A');

    // B
    addBenRow('B', 'Tử vong (Bệnh)', g.chonQuyenLoiB, g.stbhB, '-');

    // C
    addBenRow('C', 'Nội trú', g.chonQuyenLoiC, g.stbhC, '-');

    // D - SPECIAL: Only calculate for Females
    let maternityCount = 0;
    if (info.loaiHopDong === ContractType.CAN_HAN) {
        maternityCount = g.gioiTinh === Gender.NU ? 1 : 0;
    } else {
        maternityCount = g.soNu || 0;
    }
    // Only add row if count > 0 to avoid confusion, or add with 0 fee
    // Here we add it normally but the fee calculation inside will use maternityCount
    addBenRow('D', 'Thai sản', g.chonQuyenLoiD, g.stbhD, 'C', undefined, undefined, maternityCount);

    // E
    addBenRow('E', 'Ngoại trú', g.chonQuyenLoiE, g.stbhE, 'C');

    // F
    addBenRow('F', 'Nha khoa', g.chonQuyenLoiF, g.stbhF, 'C');

    // G
    addBenRow('G', 'Nước ngoài', g.chonQuyenLoiG, g.stbhG, 'C');

    // H
    let siH = g.stbhH;
    if (g.methodH === BenefitHMethod.THEO_LUONG) siH = (g.luongTrungBinh || 0) * (g.soThangLuong || 0);
    addBenRow('H', 'Trợ cấp thu nhập', g.chonQuyenLoiH, siH, 'C');

    // I
    addBenRow('I', 'Ngộ độc', g.chonQuyenLoiI, g.stbhI, 'A');
  });


  // --- SHEET 4: GROUP PRICING ---
  let sheet4Rows = '';
  sheet4Rows += Row([
    Cell('Tên nhóm', 'sHeader'),
    Cell('Số người', 'sHeader'),
    Cell('Tuổi trung bình', 'sHeader'),
    Cell('Tổng phí gốc (Nhóm)', 'sHeader'),
    Cell('Điều kiện giảm giá áp dụng', 'sHeader'),
    Cell('Phí cuối nhóm (Sau CK & LR)', 'sHeader')
  ]);

  result.detailByGroup.forEach(g => {
    // Calculate final group fee approximately based on total factors
    const groupFinal = g.tongPhiGoc * durationFactor * result.heSoGiamNhom * result.heSoDongChiTra * result.heSoTangLR * result.heSoGiamLR;
    
    // Determine Discount text
    let discountText = [];
    if (result.heSoGiamNhom < 1) discountText.push(`Size: -${Math.round((1-result.heSoGiamNhom)*100)}%`);
    if (result.heSoDongChiTra < 1) discountText.push(`Copay: -${Math.round((1-result.heSoDongChiTra)*100)}%`);
    if (result.heSoTangLR > 1) discountText.push(`LR: +${Math.round((result.heSoTangLR-1)*100)}%`);
    if (result.heSoGiamLR < 1) discountText.push(`LR: -${Math.round((1-result.heSoGiamLR)*100)}%`);

    sheet4Rows += Row([
      Cell(g.tenNhom),
      Cell(g.soNguoi, 'sNumber'),
      Cell(g.tuoiTrungBinh, 'sNumber'),
      Cell(g.tongPhiGoc, 'sCurrency'),
      Cell(discountText.join(', ') || 'None'),
      Cell(groupFinal, 'sCurrencyBold')
    ]);
  });


  // --- SHEET 5: RATE SOURCE ---
  let sheet5Rows = '';
  sheet5Rows += Row([Cell('File Rate Source', 'sHeader'), Cell('Phiên bản', 'sHeader'), Cell('Ngày load', 'sHeader'), Cell('Ghi chú', 'sHeader')]);
  sheet5Rows += Row([Cell('Rate_Table_A.md'), Cell('1.0'), Cell(createdDate), Cell('Chính sách 2025')]);
  sheet5Rows += Row([Cell('Rate_Table_BC.md'), Cell('1.0'), Cell(createdDate), Cell('Chính sách 2025')]);
  sheet5Rows += Row([Cell('Rate_Table_Supp.md'), Cell('1.0'), Cell(createdDate), Cell('Chính sách 2025')]);


  // --- ASSEMBLE XML ---
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Arial" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="sHeader">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/>
   </Borders>
   <Font ss:FontName="Arial" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#00529B" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="sNumber">
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="sCurrency">
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="sCurrencyBold">
   <Font ss:FontName="Arial" x:Family="Swiss" ss:Size="11" ss:Color="#000000" ss:Bold="1"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="sPercent">
   <NumberFormat ss:Format="0.00%"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Summary">
  <Table>
   ${sheet1Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Input">
  <Table>
   ${sheet2Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Benefit Detail">
  <Table>
   ${sheet3Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Group Pricing">
  <Table>
   ${sheet4Rows}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Rate Source">
  <Table>
   ${sheet5Rows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};