
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'vi' | 'en' | 'zh';

export const translations = {
  vi: {
    common: {
      login: 'Đăng Nhập',
      logout: 'Đăng Xuất',
      welcome: 'Xin chào',
      settings: 'Cấu hình',
      back: 'Quay lại',
      continue: 'Tiếp Tục',
      cancel: 'Hủy',
      save: 'Lưu',
      delete: 'Xóa',
      edit: 'Sửa',
      close: 'Đóng',
      copy: 'Sao chép',
      export: 'Xuất dữ liệu',
      import: 'Nhập danh sách',
      downloadTemplate: 'Tải mẫu nhập',
      add: 'Thêm',
      required: 'Bắt buộc',
      processing: 'Đang xử lý...',
      completed: 'Hoàn tất',
      error: 'Lỗi',
      success: 'Thành công',
      unnamed: 'Chưa đặt tên',
      billion: 'tỷ',
      million: 'tr',
      range_validate: 'Hạn mức từ {min} đến {max}',
      calc_method: 'Cách tính:',
      detail_benefits: 'Quyền lợi chi tiết:',
      alert_update: 'Sản phẩm này đang được cập nhật.',
      alert_otp: 'Mã OTP giả lập của bạn là: {otp}',
    },
    login: {
      title: 'Hệ Thống Tính Phí Bảo Hiểm',
      subtitle: 'Nhập email công ty để nhận mã OTP',
      emailPlaceholder: 'name@pac.vn',
      otpTitle: 'Xác Thực OTP',
      otpSubtitle: 'Mã xác thực đã gửi tới',
      back: 'Quay Lại',
      invalidEmail: 'Vui lòng nhập email hợp lệ',
      invalidOtp: 'Mã OTP không chính xác',
    },
    dashboard: {
      title: 'Danh Sách Sản Phẩm',
      subtitle: 'Vui lòng chọn sản phẩm bảo hiểm để bắt đầu tính phí.',
      ready: 'Sẵn sàng',
      soon: 'Sắp ra mắt',
      createQuote: 'Tạo báo giá mới →',
      dev: 'Đang phát triển...',
      other: 'Sản phẩm khác',
      p_uv2025: 'Sức Khỏe Ưu Việt 2025',
      p_uv2025_desc: 'Bảo hiểm sức khỏe toàn diện cho Cá nhân & Nhóm',
      p_car: 'Bảo Hiểm Xe Cơ Giới',
      p_car_desc: 'Tính phí bảo hiểm Ô tô / Xe máy',
      p_property: 'Bảo Hiểm Tài Sản',
      p_property_desc: 'Bảo hiểm cháy nổ & rủi ro tài sản',
    },
    calculator: {
      title: 'Bảo Hiểm Sức Khỏe Ưu Việt',
      subtitle: 'Nhập thông tin chi tiết bên dưới, phí bảo hiểm sẽ được tính toán tự động.',
      step1: '1. Thông Tin Chung',
      step2: '2. Danh Sách Người Được Bảo Hiểm',
      customerName: 'Tên Khách Hàng / Công Ty',
      contractType: 'Loại Hợp Đồng',
      typeIndividual: 'Cá nhân',
      typeGroup: 'Nhóm (≥ 5 người)',
      duration: 'Thời Hạn',
      renewal: 'Tái Tục (Chỉ dành cho Nhóm)',
      renewalYes: 'Có tái tục liên tục',
      renewalNo: 'Không (Mới / Gián đoạn)',
      lossRatio: 'Tỷ Lệ Bồi Thường (%)',
      lrNoteIncrease: '* Chỉ áp dụng Tăng phí (nếu có)',
      lrNoteBoth: '* Áp dụng Tăng hoặc Giảm phí',
      groupStats: 'Thống kê nhóm',
      groupStatsDesc: 'Tổng hợp số liệu từ danh sách bên dưới',
      totalMembers: 'Thành viên',
      avgAge: 'Tuổi trung bình',
      addMember: 'Thêm Người Được Bảo Hiểm',
      addMemberGroup: 'Thêm Thành Viên Vào Nhóm',
      finishSelect: 'Hoàn Tất Chọn Quyền Lợi',
      editTitle: 'Cấu Trúc Quyền Lợi Bảo Hiểm',
      editSub: 'Đang chỉnh sửa:',
      copay: 'Mức Đồng Chi Trả',
      basicSalary: 'Lương Cơ Bản (VND)',
      salaryNote: 'Sử dụng cho Quyền lợi A, B và H (nếu chọn theo lương)',
      noMainBenefit: 'Vui lòng chọn ít nhất 1 Quyền lợi chính (A, B hoặc C)',
      part1: 'I. Quyền Lợi Bảo Hiểm Chính (Phần 1)',
      part2: 'II. Quyền Lợi Bảo Hiểm Bổ Sung (Phần 2)',
    },
    tooltips: {
      contractType: "Chọn 'Cá nhân' nếu tính phí cho 1 người. Chọn 'Nhóm' nếu tính phí cho tập thể từ 5 người trở lên.",
      duration: "Áp dụng bảng tỷ lệ phí ngắn hạn: 3 tháng (30%), 6 tháng (50%), 9 tháng (75%) hoặc đủ năm (100%).",
      renewal: "Chọn 'Có tái tục liên tục' để được áp dụng giảm phí nếu Loss Ratio tốt. Chọn 'Không' nếu là đơn mới hoặc gián đoạn (chỉ bị tăng phí nếu Loss Ratio xấu).",
      lossRatio: "Nhập tỷ lệ bồi thường năm trước (nếu có).",
      part1: "Khách hàng bắt buộc phải tham gia ít nhất 1 loại hình Bảo hiểm Chính (A, B hoặc C).",
      part2: "Các quyền lợi này có thể tham gia độc lập hoặc phụ thuộc vào C (như Thai sản).",
    },
    insured: {
      name: 'Họ Tên',
      dob: 'Ngày Sinh',
      gender: 'Giới Tính',
      male: 'Nam',
      female: 'Nữ',
      age: 'tuổi',
    },
    benefits: {
      A_title: 'Bảo hiểm Tai nạn con người',
      A_desc: 'Gồm 4 quyền lợi: A1 (Tử vong/TTTBVV), A2 (TTBPVV), A3 (Trợ cấp lương), A4 (Chi phí y tế).',
      B_title: 'Chết do ốm đau, bệnh tật',
      B_desc: 'Bảo hiểm tử vong do ốm đau, bệnh tật, thai sản. STBH từ 10 triệu đến 5 tỷ đồng.',
      C_title: 'Chi phí y tế nội trú',
      C_desc: 'Chi trả chi phí nằm viện, phẫu thuật do ốm đau, bệnh tật.',
      D_title: 'Thai sản',
      D_desc: 'Chi phí sinh nở và biến chứng thai sản. Yêu cầu tham gia C.',
      E_title: 'Điều trị ngoại trú',
      E_desc: 'Khám chữa bệnh không nằm viện (thuốc, xét nghiệm...).',
      F_title: 'Chăm sóc răng',
      F_desc: 'Khám răng, trám răng, nhổ răng, lấy cao răng, điều trị tủy.',
      G_title: 'Khám chữa bệnh nước ngoài',
      G_desc: 'Phạm vi: Thái Lan & Singapore. Yêu cầu tham gia C.',
      H_title: 'Trợ cấp nằm viện',
      H_desc: 'Trợ cấp lương trong thời gian nằm viện. Tính theo số tháng lương.',
      I_title: 'Ngộ độc thức ăn, đồ uống',
      I_desc: 'Rủi ro ngộ độc, hít khí độc. Kế thừa STBH từ Quyền lợi A.',
      
      methodSalary: 'Theo Lương',
      methodSI: 'Theo Số Tiền BH',
      months: 'Số tháng',
      limit: 'Số tiền bảo hiểm',
      program: 'Chọn chương trình',
      selectLimit: 'Chọn hạn mức',
      
      sub_A1: 'A1. Tử vong/TTTBVV',
      sub_A2: 'A2. TT bộ phận vĩnh viễn',
      sub_A3: 'A3. Trợ cấp lương ngày',
      sub_A4: 'A4. Chi phí y tế tai nạn',
      
      sub_G1: 'G.1 Vận chuyển cấp cứu',
      sub_G2: 'G.2 Y tế điều trị nội trú',

      // Validation & States
      onlyFemale: 'Chỉ dành cho Nữ',
      fixed400: 'Hạn mức cố định: 400 triệu',
      require_Benefit_C: 'Cần chọn Quyền lợi C',
      require_C: 'Cần chọn C',
      require_A: 'Cần chọn A',
      require_A1: 'Yêu cầu chọn A1',
      require_A2: 'Yêu cầu chọn A2',
      require_A3: 'Yêu cầu chọn A3',
      require_A4: 'Yêu cầu chọn A4',
      equal_C: 'Bằng STBH Quyền lợi C',
      only_ThaiSin: 'Chỉ áp dụng cho Thái Lan & Singapore',
      inherit_A: 'STBH kế thừa từ quyền lợi A tương ứng',
    },
    result: {
      title: 'Kết Quả Tính Phí',
      important: 'Lưu ý quan trọng',
      totalFinal: 'Tổng Phí Cuối Cùng',
      invalid: 'Chưa đủ điều kiện',
      optimized: 'Đã tối ưu hóa quyền lợi',
      baseFee: 'Tổng phí gốc (chưa giảm)',
      groupSize: 'Quy mô nhóm',
      lrAdj: 'Loss Ratio (Tăng/Giảm)',
      durationAdj: 'Hệ số thời hạn',
      exportExcel: 'Xuất Báo Giá Excel',
      checkErrors: 'Vui lòng kiểm tra lỗi',
      detailMember: 'Chi tiết từng thành viên',
      expandAll: 'Mở rộng tất cả',
      collapseAll: 'Thu gọn tất cả',
      colBenefit: 'Quyền lợi',
      colGeo: 'KV',
      colDiscounted: 'Đã giảm',
      colMin: 'Sàn (Min)',
      colApply: 'Áp dụng',
      provisionalNote: 'Phí tạm tính bên dưới chưa có hiệu lực cho đến khi thỏa mãn điều kiện.',
      copay_short: 'Co-pay',
      min_fee_applied: 'Có quyền lợi áp dụng phí sàn',
    },
    validation: {
        groupMin5: 'Hợp đồng Nhóm yêu cầu tối thiểu 5 thành viên.',
        individualMax4: 'Số lượng 5 người trở lên được xem là Nhóm.',
        benefitNA: 'Quyền lợi không áp dụng cho độ tuổi hoặc khu vực này.',
    },
    geo: {
      vn: 'Việt Nam',
      asia: 'Châu Á',
      global: 'Toàn Cầu'
    }
  },
  en: {
    common: {
      login: 'Login',
      logout: 'Logout',
      welcome: 'Hello',
      settings: 'Settings',
      back: 'Back',
      continue: 'Continue',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      copy: 'Copy',
      export: 'Export Data',
      import: 'Import List',
      downloadTemplate: 'Download Template',
      add: 'Add',
      required: 'Required',
      processing: 'Processing...',
      completed: 'Completed',
      error: 'Error',
      success: 'Success',
      unnamed: 'Unnamed',
      billion: 'B',
      million: 'M',
      range_validate: 'Limit from {min} to {max}',
      calc_method: 'Method:',
      detail_benefits: 'Details:',
      alert_update: 'This product is being updated.',
      alert_otp: 'Your simulated OTP is: {otp}',
    },
    login: {
      title: 'Premium Calculation System',
      subtitle: 'Enter company email to receive OTP',
      emailPlaceholder: 'name@pac.vn',
      otpTitle: 'Verify OTP',
      otpSubtitle: 'OTP code sent to',
      back: 'Back',
      invalidEmail: 'Please enter a valid email',
      invalidOtp: 'Incorrect OTP code',
    },
    dashboard: {
      title: 'Product List',
      subtitle: 'Please select an insurance product to start.',
      ready: 'Ready',
      soon: 'Coming Soon',
      createQuote: 'Create New Quote →',
      dev: 'In Development...',
      other: 'Other Product',
      p_uv2025: 'Uu Viet Health 2025',
      p_uv2025_desc: 'Comprehensive Health Insurance for Individuals & Groups',
      p_car: 'Motor Vehicle Insurance',
      p_car_desc: 'Premium calculation for Cars / Motorbikes',
      p_property: 'Property Insurance',
      p_property_desc: 'Fire & Property Risk Insurance',
    },
    calculator: {
      title: 'Uu Viet Health Insurance',
      subtitle: 'Enter details below, premium will be calculated automatically.',
      step1: '1. General Information',
      step2: '2. Insured Person List',
      customerName: 'Customer / Company Name',
      contractType: 'Contract Type',
      typeIndividual: 'Individual',
      typeGroup: 'Group (≥ 5 people)',
      duration: 'Duration',
      renewal: 'Renewal (Groups only)',
      renewalYes: 'Continuous Renewal',
      renewalNo: 'No (New / Interrupted)',
      lossRatio: 'Loss Ratio (%)',
      lrNoteIncrease: '* Only Loading applied (if any)',
      lrNoteBoth: '* Loading or Discount applied',
      groupStats: 'Group Statistics',
      groupStatsDesc: 'Data summary from the list below',
      totalMembers: 'Members',
      avgAge: 'Avg Age',
      addMember: 'Add Insured Person',
      addMemberGroup: 'Add Group Member',
      finishSelect: 'Finish Benefit Selection',
      editTitle: 'Benefit Structure Configuration',
      editSub: 'Editing:',
      copay: 'Co-Payment',
      basicSalary: 'Basic Salary (VND)',
      salaryNote: 'Used for Benefits A, B and H (if salary-based)',
      noMainBenefit: 'Please select at least 1 Main Benefit (A, B or C)',
      part1: 'I. Main Insurance Benefits (Part 1)',
      part2: 'II. Supplementary Benefits (Part 2)',
    },
    tooltips: {
      contractType: "Select 'Individual' for 1 person. Select 'Group' for 5 or more people.",
      duration: "Short-term rates apply: 3 months (30%), 6 months (50%), 9 months (75%) or full year (100%).",
      renewal: "Select 'Continuous Renewal' to apply discount if Loss Ratio is good. Select 'No' for new/interrupted contracts.",
      lossRatio: "Enter previous year's Loss Ratio (if any).",
      part1: "Customer must participate in at least 1 Main Benefit (A, B or C).",
      part2: "These benefits can be standalone or depend on C (like Maternity).",
    },
    insured: {
      name: 'Full Name',
      dob: 'Date of Birth',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      age: 'years old',
    },
    benefits: {
      A_title: 'Personal Accident',
      A_desc: 'Includes 4 benefits: A1 (Death/PTD), A2 (PPD), A3 (Daily Allowance), A4 (Medical Exp).',
      B_title: 'Death due to Illness/Disease',
      B_desc: 'Death coverage due to illness, disease, maternity. SI from 10M to 5B VND.',
      C_title: 'Inpatient Medical Expense',
      C_desc: 'Covers hospitalization and surgical costs due to illness/disease.',
      D_title: 'Maternity',
      D_desc: 'Childbirth and complications. Requires Benefit C.',
      E_title: 'Outpatient Treatment',
      E_desc: 'Non-hospitalized treatment (prescription, tests...).',
      F_title: 'Dental Care',
      F_desc: 'Dental exam, filling, extraction, scaling, root canal.',
      G_title: 'Overseas Treatment',
      G_desc: 'Scope: Thailand & Singapore. Requires Benefit C.',
      H_title: 'Hospitalization Allowance',
      H_desc: 'Daily income support during hospitalization. Based on salary months.',
      I_title: 'Food/Gas Poisoning',
      I_desc: 'Risks of poisoning. Inherits SI from Benefit A.',
      
      methodSalary: 'By Salary',
      methodSI: 'By Sum Insured',
      months: 'Months',
      limit: 'Sum Insured',
      program: 'Select Program',
      selectLimit: 'Select Limit',
      
      sub_A1: 'A1. Death/Perm. Total Disab.',
      sub_A2: 'A2. Perm. Partial Disab.',
      sub_A3: 'A3. Daily Salary Allowance',
      sub_A4: 'A4. Accident Medical Exp.',
      
      sub_G1: 'G.1 Emergency Transport',
      sub_G2: 'G.2 Inpatient Medical',

      // Validation & States
      onlyFemale: 'Only for Female',
      fixed400: 'Fixed Limit: 400M VND',
      require_Benefit_C: 'Requires Benefit C',
      require_C: 'Requires C',
      require_A: 'Requires A',
      require_A1: 'Requires A1',
      require_A2: 'Requires A2',
      require_A3: 'Requires A3',
      require_A4: 'Requires A4',
      equal_C: 'Equal to Benefit C SI',
      only_ThaiSin: 'Only applies to Thailand & Singapore',
      inherit_A: 'SI inherits from corresponding Benefit A',
    },
    result: {
      title: 'Premium Result',
      important: 'Important Notice',
      totalFinal: 'Final Total Premium',
      invalid: 'Not Eligible',
      optimized: 'Benefits Optimized',
      baseFee: 'Total Base Premium',
      groupSize: 'Group Size',
      lrAdj: 'Loss Ratio Adj',
      durationAdj: 'Duration Factor',
      exportExcel: 'Export Excel Quote',
      checkErrors: 'Please check errors',
      detailMember: 'Member Details',
      expandAll: 'Expand All',
      collapseAll: 'Collapse All',
      colBenefit: 'Benefit',
      colGeo: 'Geo',
      colDiscounted: 'Discounted',
      colMin: 'Floor (Min)',
      colApply: 'Applied',
      provisionalNote: 'The provisional premium below is not effective until conditions are met.',
      copay_short: 'Co-pay',
      min_fee_applied: 'Minimum premium applied',
    },
    validation: {
        groupMin5: 'Group contract requires at least 5 members.',
        individualMax4: '5 or more people is considered a Group.',
        benefitNA: 'Benefit not applicable for this age or region.',
    },
    geo: {
      vn: 'Vietnam',
      asia: 'Asia',
      global: 'Global'
    }
  },
  zh: {
    common: {
      login: '登录',
      logout: '登出',
      welcome: '你好',
      settings: '设置',
      back: '返回',
      continue: '继续',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      close: '关闭',
      copy: '复制',
      export: '导出数据',
      import: '导入列表',
      downloadTemplate: '下载模板',
      add: '添加',
      required: '必填',
      processing: '处理中...',
      completed: '完成',
      error: '错误',
      success: '成功',
      unnamed: '未命名',
      billion: 'B',
      million: 'M',
      range_validate: '限制从 {min} 到 {max}',
      calc_method: '计算方式:',
      detail_benefits: '详细利益:',
      alert_update: '此产品正在更新中。',
      alert_otp: '您的模拟 OTP 是：{otp}',
    },
    login: {
      title: '保费计算系统',
      subtitle: '输入公司邮箱接收 OTP',
      emailPlaceholder: 'name@pac.vn',
      otpTitle: '验证 OTP',
      otpSubtitle: 'OTP 代码已发送至',
      back: '返回',
      invalidEmail: '请输入有效的电子邮件',
      invalidOtp: 'OTP 代码不正确',
    },
    dashboard: {
      title: '产品列表',
      subtitle: '请选择保险产品以开始计算。',
      ready: '可用',
      soon: '即将推出',
      createQuote: '创建新报价 →',
      dev: '开发中...',
      other: '其他产品',
      p_uv2025: '优越健康保险 2025',
      p_uv2025_desc: '面向个人和团体的全面健康保险',
      p_car: '机动车保险',
      p_car_desc: '汽车/摩托车保费计算',
      p_property: '财产保险',
      p_property_desc: '火灾和财产风险保险',
    },
    calculator: {
      title: '优越健康保险',
      subtitle: '输入以下详细信息，保费将自动计算。',
      step1: '1. 一般信息',
      step2: '2. 被保险人名单',
      customerName: '客户 / 公司名称',
      contractType: '合同类型',
      typeIndividual: '个人',
      typeGroup: '团体 (≥ 5 人)',
      duration: '期限',
      renewal: '续保 (仅限团体)',
      renewalYes: '连续续保',
      renewalNo: '否 (新保 / 中断)',
      lossRatio: '赔付率 (%)',
      lrNoteIncrease: '* 仅适用加费 (如有)',
      lrNoteBoth: '* 适用加费或折扣',
      groupStats: '团体统计',
      groupStatsDesc: '下表数据汇总',
      totalMembers: '成员',
      avgAge: '平均年龄',
      addMember: '添加被保险人',
      addMemberGroup: '添加团体成员',
      finishSelect: '完成利益选择',
      editTitle: '保险利益结构配置',
      editSub: '正在编辑:',
      copay: '共同支付 (Co-pay)',
      basicSalary: '基本工资 (VND)',
      salaryNote: '用于利益 A, B 和 H (如按工资计算)',
      noMainBenefit: '请至少选择 1 项主要利益 (A, B 或 C)',
      part1: 'I. 主要保险利益 (第 1 部分)',
      part2: 'II. 附加利益 (第 2 部分)',
    },
    tooltips: {
      contractType: "1人请选择'个人'。5人及以上请选择'团体'。",
      duration: "适用短期费率表：3个月(30%)，6个月(50%)，9个月(75%)或全年(100%)。",
      renewal: "选择'连续续保'以便在赔付率良好时应用折扣。新保单/中断请选择'否'。",
      lossRatio: "输入上一年的赔付率（如有）。",
      part1: "客户必须参加至少1项主要保险利益（A，B或C）。",
      part2: "这些利益可以独立参加或依赖于C（如生育）。",
    },
    insured: {
      name: '姓名',
      dob: '出生日期',
      gender: '性别',
      male: '男',
      female: '女',
      age: '岁',
    },
    benefits: {
      A_title: '人身意外保险',
      A_desc: '包括 4 项利益: A1 (身故/全残), A2 (部分残疾), A3 (津贴), A4 (医疗费).',
      B_title: '疾病身故',
      B_desc: '因疾病、怀孕导致的身故。保额 1000万 至 50亿 越盾。',
      C_title: '住院医疗费用',
      C_desc: '支付因疾病导致的住院和手术费用。',
      D_title: '生育',
      D_desc: '分娩及并发症费用。需参加利益 C。',
      E_title: '门诊治疗',
      E_desc: '非住院治疗 (处方药, 检查...)。',
      F_title: '牙科护理',
      F_desc: '牙科检查, 补牙, 拔牙, 洁牙, 根管治疗。',
      G_title: '海外治疗',
      G_desc: '范围: 泰国 & 新加坡。需参加利益 C。',
      H_title: '住院津贴',
      H_desc: '住院期间的收入支持。按工资月数计算。',
      I_title: '食物/气体中毒',
      I_desc: '中毒风险。保额继承自利益 A。',
      
      methodSalary: '按工资',
      methodSI: '按保额',
      months: '月数',
      limit: '保额',
      program: '选择计划',
      selectLimit: '选择限额',
      
      sub_A1: 'A1. 身故/永久全残',
      sub_A2: 'A2. 永久部分残疾',
      sub_A3: 'A3. 日工资津贴',
      sub_A4: 'A4. 意外医疗费用',
      
      sub_G1: 'G.1 紧急运送',
      sub_G2: 'G.2 住院医疗',

      // Validation & States
      onlyFemale: '仅限女性',
      fixed400: '固定限额：4亿越南盾',
      require_Benefit_C: '需选择利益 C',
      require_C: '需选择 C',
      require_A: '需选择 A',
      require_A1: '需选择 A1',
      require_A2: '需选择 A2',
      require_A3: '需选择 A3',
      require_A4: '需选择 A4',
      equal_C: '等于利益 C 保额',
      only_ThaiSin: '仅适用于泰国和新加坡',
      inherit_A: '保额继承自相应的利益 A',
    },
    result: {
      title: '保费结果',
      important: '重要提示',
      totalFinal: '最终总保费',
      invalid: '不符合条件',
      optimized: '利益已优化',
      baseFee: '总基本保费',
      groupSize: '团体规模',
      lrAdj: '赔付率调整',
      durationAdj: '期限系数',
      exportExcel: '导出 Excel 报价',
      checkErrors: '请检查错误',
      detailMember: '成员详情',
      expandAll: '展开全部',
      collapseAll: '全部收起',
      colBenefit: '利益',
      colGeo: '区域',
      colDiscounted: '折后',
      colMin: '底价 (Min)',
      colApply: '应用',
      provisionalNote: '在满足条件之前，以下暂定保费无效。',
      copay_short: 'Co-pay',
      min_fee_applied: '已应用最低保费',
    },
    validation: {
        groupMin5: '团体合同要求至少5名成员。',
        individualMax4: '5人或以上被视为团体。',
        benefitNA: '此利益不适用于此年龄或地区。',
    },
    geo: {
      vn: '越南',
      asia: '亚洲',
      global: '全球'
    }
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('vi');

  const t = (path: string, params?: Record<string, string | number>): string => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) {
        return path;
      }
      current = current[key];
    }
    
    let result = current as string;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            result = result.replace(`{${key}}`, String(value));
        });
    }
    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Component for Language Switcher UI
export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    
    return (
        <div className="flex bg-white/20 rounded-md p-1 gap-1">
            <button 
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'vi' ? 'bg-white text-phuhung-blue shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
                VN
            </button>
            <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'en' ? 'bg-white text-phuhung-blue shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
                EN
            </button>
            <button 
                onClick={() => setLanguage('zh')}
                className={`px-2 py-1 text-xs font-bold rounded transition-colors ${language === 'zh' ? 'bg-white text-phuhung-blue shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
            >
                ZH
            </button>
        </div>
    );
};
