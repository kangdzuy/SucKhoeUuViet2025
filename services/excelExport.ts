
import { GeneralInfo, InsuranceGroup, CalculationResult, ContractType, BenefitAMethod, BenefitHMethod, BenefitBMethod, BenefitASalaryOption, Gender, SystemConfig, Geography } from '../types';
import { getRateFromConfig } from './calculationService';

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

// Format percent for Excel display (e.g. 0.1 -> 10%)
const fmtPct = (val: number) => Math.round(val * 100) + '%';

const mapGeoToCSV = (g: Geography): string => {
    if (g === Geography.CHAU_A) return "Asia";
    if (g === Geography.TOAN_CAU) return "Global";
    return "VN";
}

export const exportToExcel = (
  info: GeneralInfo, 
  groups: InsuranceGroup[], 
  result: CalculationResult,
  config: SystemConfig // ADDED CONFIG
) => {
  const fileName = `Bao_Gia_${info.tenKhachHang ? info.tenKhachHang.replace(/[^a-z0-9]/gi, '_') : 'Khach_Hang'}_${new Date().toISOString().slice(0,10)}.xls`;
  const createdDate = new Date().toISOString();
  
  // Calculate common factors from config
  const durationFactor = config.durationFactors[info.thoiHanBaoHiem] || 1;

  // --- SHEET 1: SUMMARY ---
  let sheet1Rows = '';
  // Headers
  sheet1Rows += Row([
    Cell('Tên báo giá', 'sHeader'),
    Cell('Ngày tạo', 'sHeader'),
    Cell('Sản phẩm', 'sHeader'),
    Cell('Cá nhân / Nhóm', 'sHeader'),
    Cell('Số người', 'sHeader'),
    // Cell('Phạm vi', 'sHeader'), // Removed global scope
    Cell('Thời hạn', 'sHeader'),
    Cell('Tổng phí gốc', 'sHeader'),
    // Cell('Tổng % Tăng/Giảm', 'sHeader'), // Removed global percent
    Cell('Hệ số thời hạn', 'sHeader'),
    Cell('Phí cuối cùng', 'sHeader')
  ]);

  sheet1Rows += Row([
    Cell(info.tenKhachHang),
    Cell(new Date().toLocaleDateString('vi-VN')),
    Cell('HEA 2025 - Ưu Việt'),
    Cell(info.loaiHopDong === ContractType.NHOM ? 'Nhóm' : 'Cá nhân'),
    Cell(result.tongSoNguoi, 'sNumber'),
    // Cell(info.phamViDiaLy), // Removed global scope
    Cell(info.thoiHanBaoHiem),
    Cell(result.tongPhiGoc, 'sCurrency'), 
    // Cell(result.totalAdjPercent, 'sPercent'), // Removed global
    Cell(durationFactor, 'sNumber'),
    Cell(result.tongPhiCuoi, 'sCurrencyBold')
  ]);

  // --- SHEET 2: INPUT (UPDATED TO DETAILED COLUMNS) ---
  let sheet2Rows = '';
  sheet2Rows += Row([
    Cell('Họ tên / Tên nhóm', 'sHeader'),
    Cell('Ngày sinh (dd/mm/yyyy)', 'sHeader'),
    Cell('Giới tính', 'sHeader'),
    Cell('Lương Cơ Bản', 'sHeader'), 
    Cell('CoPay (%)', 'sHeader'), 
    
    Cell('Phạm vi A', 'sHeader'), 
    Cell('A (Chính): Nhập Số Tiền hoặc Số Tháng', 'sHeader'), 
    Cell('A1 (Tử vong): C/K', 'sHeader'), 
    Cell('A2 (TTBPVV): C/K', 'sHeader'), 
    Cell('A3 (Trợ cấp): C/K', 'sHeader'), 
    Cell('A4 (Y tế): Nhập Số Tiền hoặc C', 'sHeader'),
    
    Cell('Phạm vi B', 'sHeader'), 
    Cell('B (Sinh mạng): Nhập Số Tiền hoặc Số Tháng', 'sHeader'), 
    
    Cell('Phạm vi C', 'sHeader'), 
    Cell('C (Nội trú): Nhập Số Tiền', 'sHeader'),
    
    Cell('Phạm vi D', 'sHeader'), 
    Cell('D (Thai sản): Nhập Số Tiền hoặc C', 'sHeader'), 
    
    Cell('Phạm vi E', 'sHeader'), 
    Cell('E (Ngoại trú): Nhập Số Tiền', 'sHeader'), 
    
    Cell('Phạm vi F', 'sHeader'), 
    Cell('F (Nha khoa): Nhập Số Tiền', 'sHeader'),
    
    Cell('Phạm vi G', 'sHeader'), 
    Cell('G1 (VC Cấp cứu): Nhập Số Tiền hoặc C', 'sHeader'), 
    Cell('G2 (Y tế QT): Nhập Số Tiền hoặc C', 'sHeader'), 
    
    Cell('Phạm vi H', 'sHeader'), 
    Cell('H (Trợ cấp): Nhập Số Tháng', 'sHeader'), 
    
    Cell('I1 (TV Ngộ độc): C/K', 'sHeader'), 
    Cell('I2 (TTBP Ngộ độc): C/K', 'sHeader'), 
    Cell('I3 (TC Ngộ độc): C/K', 'sHeader'), 
    Cell('I4 (YT Ngộ độc): C/K', 'sHeader')
  ]);

  groups.forEach(g => {
    // Logic for Main A export: Money vs Months
    let exportA = 0;
    if (g.chonQuyenLoiA) {
        exportA = g.methodA === BenefitAMethod.THEO_LUONG ? g.soThangLuongA : g.stbhA;
    }

    // Logic for Main B export
    let exportB = 0;
    if (g.chonQuyenLoiB) {
        exportB = g.methodB === BenefitBMethod.THEO_LUONG ? g.soThangLuongB : g.stbhB;
    }

    sheet2Rows += Row([
      Cell(g.tenNhom),
      Cell(g.ngaySinh || ''),
      Cell(g.gioiTinh || 'N/A'),
      Cell(g.luongCoBan || 0, 'sCurrency'), 
      Cell(g.mucDongChiTra),
      
      // A
      Cell(mapGeoToCSV(g.geoA)),
      Cell(exportA, 'sNumber'),
      Cell((g.chonQuyenLoiA && g.subA_A1) ? 'C' : 'K'),
      Cell((g.chonQuyenLoiA && g.subA_A2) ? 'C' : 'K'),
      Cell((g.chonQuyenLoiA && g.subA_TroCap) ? 'C' : 'K'),
      Cell((g.chonQuyenLoiA && g.subA_YTe) ? g.stbhA_YTe : 0, 'sNumber'),
      
      // B
      Cell(mapGeoToCSV(g.geoB)),
      Cell(exportB, 'sNumber'),
      
      // C
      Cell(mapGeoToCSV(g.geoC)),
      Cell(g.chonQuyenLoiC ? g.stbhC : 0, 'sNumber'),
      
      // D
      Cell(mapGeoToCSV(g.geoD)),
      Cell(g.chonQuyenLoiD ? (g.stbhD === g.stbhC ? 'C' : g.stbhD) : 'K'),
      
      // E
      Cell(mapGeoToCSV(g.geoE)),
      Cell(g.chonQuyenLoiE ? g.stbhE : 0, 'sNumber'),
      
      // F
      Cell(mapGeoToCSV(g.geoF)),
      Cell(g.chonQuyenLoiF ? g.stbhF : 0, 'sNumber'),
      
      // G
      Cell(mapGeoToCSV(g.geoG)),
      Cell((g.chonQuyenLoiG && g.subG_VanChuyen) ? g.stbhG_VanChuyen : 0, 'sNumber'),
      Cell((g.chonQuyenLoiG && g.subG_YTe) ? g.stbhG_YTe : 0, 'sNumber'),
      
      // H
      Cell(mapGeoToCSV(g.geoH)),
      Cell(g.chonQuyenLoiH ? g.soThangLuong : 0, 'sNumber'),
      
      // I
      Cell((g.chonQuyenLoiI && g.subI_I1) ? 'C' : 'K'),
      Cell((g.chonQuyenLoiI && g.subI_I2) ? 'C' : 'K'),
      Cell((g.chonQuyenLoiI && g.subI_I3) ? 'C' : 'K'),
      Cell((g.chonQuyenLoiI && g.subI_I4) ? 'C' : 'K'),
    ]);
  });

  // --- SHEET 3: BENEFIT DETAIL ---
  let sheet3Rows = '';
  sheet3Rows += Row([
    Cell('Tên Nhóm', 'sHeader'),
    Cell('Mã QL', 'sHeader'),
    Cell('Tên quyền lợi', 'sHeader'),
    Cell('Phạm Vi (Geo)', 'sHeader'), // ADDED GEO COLUMN
    Cell('STBH (Hạn mức)', 'sHeader'),
    Cell('Tỷ lệ phí Cơ Bản (%)', 'sHeader'),
    Cell('Phí Gốc', 'sHeader'),
    Cell('Phí Đã Giảm', 'sHeader'), // New Column
    Cell('Phí Thuần (Min)', 'sHeader'),
    Cell('Phí Cuối Cùng', 'sHeader'),
    Cell('Ghi chú', 'sHeader') // Replaced Status with Note/Icon text
  ]);

  groups.forEach(g => {
    const age = g.tuoiTrungBinh;
    // const geo = g.phamViDiaLy; // Use group level Geo -- NO, USE PER BENEFIT

    // Calculate group specific adjustment
    const percentCopay = -(config.copayDiscounts[g.mucDongChiTra] || 0);
    const adjFactor = 1 + result.percentGroup + result.percentLR + percentCopay;

    const addBenRow = (code: string, name: string, selected: boolean, geo: string, si: number, dep: string, method?: string, extra?: any, specificCount?: number) => {
       let note = '';
       let rateBase = 0;
       let rateMin = 0;
       
       let finalFee = 0;
       let rawBaseFee = 0;
       let adjBaseFee = 0;
       let minFee = 0;
       
       let displayDiscounted = 0;
       let displayMin = 0;

       if (selected && si > 0) {
           // Get Base Rate and Min Rate
           rateBase = getRateFromConfig(config, code, age, geo, si, extra, false);
           rateMin = getRateFromConfig(config, code, age, geo, si, extra, true);
           
           const countToUse = specificCount !== undefined ? specificCount : g.soNguoi;
           
           rawBaseFee = si * rateBase * countToUse;
           minFee = si * rateMin * countToUse;
           
           // Apply adjustments
           adjBaseFee = rawBaseFee * adjFactor;
           
           // Apply Duration Factor for Display to match Final
           displayDiscounted = adjBaseFee * durationFactor;
           displayMin = minFee * durationFactor;

           // GRANULAR FLOOR CHECK: Max(AdjustedBase, Min)
           finalFee = Math.max(displayDiscounted, displayMin);
           
           if (displayMin > displayDiscounted) {
               note = '(*) Áp dụng phí sàn';
           }
       }

       let displayCode = code;
       if (code === 'A1_MAIN') displayCode = 'A1';
       if (code === 'A2_MAIN') displayCode = 'A2';
       if (code === 'A_ALLOWANCE') displayCode = 'A3';
       if (code === 'A_MEDICAL') displayCode = 'A4';
       if (code === 'G_TRANSPORT') displayCode = 'G1';
       if (code === 'G_MEDICAL') displayCode = 'G2';
       if (code === 'H_HOSPITALIZATION') displayCode = 'H';
       if (code === 'I_MAIN') displayCode = 'I1/I2'; // Placeholder for export logic

       // Only add row if selected (or keep structure but zero out)
       // Let's keep rows for selected benefits
       if (selected) {
            sheet3Rows += Row([
                Cell(g.tenNhom),
                Cell(displayCode),
                Cell(name),
                Cell(geo),
                Cell(si, 'sNumber'),
                Cell(rateBase, 'sPercent'),
                Cell(Math.round(rawBaseFee), 'sCurrency'),
                Cell(Math.round(displayDiscounted), 'sCurrency'),
                Cell(Math.round(displayMin), 'sCurrency'),
                Cell(Math.round(finalFee), 'sCurrencyBold'),
                Cell(note)
            ]);
       }
    };

    let siA = g.stbhA;
    if (g.methodA === BenefitAMethod.THEO_LUONG) siA = (g.luongCoBan || 0) * (g.soThangLuongA || 0);
    
    // Split A1 and A2 rows
    addBenRow('A1_MAIN', 'Tử vong/Thương tật toàn bộ vĩnh viễn', g.chonQuyenLoiA && g.subA_A1, g.geoA, siA, '-');
    addBenRow('A2_MAIN', 'Thương tật bộ phận vĩnh viễn', g.chonQuyenLoiA && g.subA_A2, g.geoA, siA, '-');

    let siA1 = 0;
    if (g.subA_TroCap_Option === BenefitASalaryOption.OP_3_5) siA1 = (g.luongCoBan || 0) * 5;
    if (g.subA_TroCap_Option === BenefitASalaryOption.OP_6_9) siA1 = (g.luongCoBan || 0) * 9;
    if (g.subA_TroCap_Option === BenefitASalaryOption.OP_10_12) siA1 = (g.luongCoBan || 0) * 12;
    addBenRow('A_ALLOWANCE', 'Trợ cấp lương ngày trong thời gian điều trị Thương tật tạm thời', g.subA_TroCap, g.geoA, siA1, 'A', undefined, { option: g.subA_TroCap_Option });

    addBenRow('A_MEDICAL', 'Chi phí y tế, chi phí vận chuyển cấp cứu', g.subA_YTe, g.geoA, g.stbhA_YTe, 'A');
    
    // Calculate SI B
    let siB = g.stbhB;
    if (g.methodB === BenefitBMethod.THEO_LUONG) siB = (g.luongCoBan || 0) * (g.soThangLuongB || 0);
    addBenRow('B', 'Chết do ốm đau, bệnh tật', g.chonQuyenLoiB, g.geoB, siB, '-');
    
    addBenRow('C', 'Chi phí y tế nội trú do ốm đau, bệnh tật', g.chonQuyenLoiC, g.geoC, g.stbhC, '-');

    let maternityCount = 0;
    if (info.loaiHopDong === ContractType.CAN_HAN) {
        maternityCount = g.gioiTinh === Gender.NU ? 1 : 0;
    } else {
        maternityCount = g.soNu || 0;
    }
    addBenRow('D', 'Thai sản', g.chonQuyenLoiD, g.geoD, g.stbhD, 'C', undefined, undefined, maternityCount);

    addBenRow('E', 'Điều trị ngoại trú do ốm đau, bệnh tật', g.chonQuyenLoiE, g.geoE, g.stbhE, 'C');
    addBenRow('F', 'Chăm sóc răng', g.chonQuyenLoiF, g.geoF, g.stbhF, 'C');
    
    // G - SPLIT INTO G1 and G2
    if (g.chonQuyenLoiG) {
        addBenRow('G_TRANSPORT', 'Khám chữa bệnh và điều trị ở nước ngoài (Vận chuyển)', g.subG_VanChuyen, g.geoG, g.stbhG_VanChuyen, 'C');
        addBenRow('G_MEDICAL', 'Khám chữa bệnh và điều trị ở nước ngoài (Y tế)', g.subG_YTe, g.geoG, g.stbhG_YTe, 'C');
    }

    let siH = g.stbhH;
    if (g.methodH === BenefitHMethod.THEO_LUONG) siH = (g.luongCoBan || 0) * (g.soThangLuong || 0);
    // H - Simplified to single Benefit
    addBenRow('H_HOSPITALIZATION', 'Trợ cấp lương ngày trong quá trình điều trị nội trú', g.chonQuyenLoiH, g.geoH, siH, 'C');
    
    // I - SPLIT I1, I2, I3, I4
    if (g.chonQuyenLoiI) {
        // I1 - Inherits A1 (siA)
        addBenRow('I_MAIN', 'I1 - Tử vong/Thương tật toàn bộ vĩnh viễn (Ngộ độc)', g.subI_I1 && g.subA_A1, g.geoI, siA, 'A1');
        // I2 - Inherits A2 (siA) - Using I_MAIN Rate table
        addBenRow('I_MAIN', 'I2 - Thương tật bộ phận vĩnh viễn (Ngộ độc)', g.subI_I2 && g.subA_A2, g.geoI, siA, 'A2');
        // I3 - Inherits A3 (siA1 allowance) - Using I_ALLOWANCE
        addBenRow('I_ALLOWANCE', 'I3 - Trợ cấp lương ngày (Ngộ độc)', g.subI_I3 && g.subA_TroCap, g.geoI, siA1, 'A3');
        // I4 - Inherits A4 (stbhA_YTe) - Using I_MEDICAL
        addBenRow('I_MEDICAL', 'I4 - Chi phí y tế (Ngộ độc)', g.subI_I4 && g.subA_YTe, g.geoI, g.stbhA_YTe, 'A4');
    }
  });


  // --- SHEET 4: GROUP PRICING ---
  let sheet4Rows = '';
  sheet4Rows += Row([
    Cell('Tên nhóm', 'sHeader'),
    Cell('Số người', 'sHeader'),
    Cell('Tuổi trung bình', 'sHeader'),
    Cell('Tổng phí gốc', 'sHeader'),
    Cell('Tổng % Tăng/Giảm', 'sHeader'),
    Cell('Hệ số thời hạn', 'sHeader'),
    Cell('Phí cuối cùng', 'sHeader')
  ]);

  result.detailByGroup.forEach(g => {
    let discountText = [];
    if (g.percentCopay !== 0) discountText.push(`Copay: ${fmtPct(g.percentCopay)}`);
    if (result.percentGroup !== 0) discountText.push(`Size: ${fmtPct(result.percentGroup)}`);
    if (result.percentLR !== 0) discountText.push(`LR: ${fmtPct(result.percentLR)}`);
    
    sheet4Rows += Row([
      Cell(g.tenNhom),
      Cell(g.soNguoi, 'sNumber'),
      Cell(g.tuoiTrungBinh, 'sNumber'),
      Cell(g.tongPhiGoc, 'sCurrency'),
      Cell(discountText.join(', ') || '0%'),
      Cell(durationFactor, 'sNumber'),
      Cell(g.tongPhiCuoi, 'sCurrencyBold')
    ]);
  });

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