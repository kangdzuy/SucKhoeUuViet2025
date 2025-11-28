import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface Props {
  onLoginSuccess: (email: string) => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      // In reality, this would trigger backend to send email
      alert(`Mã OTP giả lập của bạn là: 123456`);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      setError('Mã OTP không chính xác (Gợi ý: 123456)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-phuhung-blue p-8 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none"></div>
           <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
              <ShieldCheck className="w-10 h-10 text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-1">Phú Hưng Assurance</h2>
           <p className="text-blue-100 text-sm">Hệ Thống Tính Phí Bảo Hiểm</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Đăng Nhập</h3>
                <p className="text-gray-500 text-sm mt-1">Nhập email công ty để nhận mã xác thực</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-phuhung-blue/20 focus:border-phuhung-blue outline-none transition-all"
                    placeholder="example@phuhung.com"
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-phuhung-blue hover:bg-phuhung-blueHover text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? 'Đang gửi...' : <>Tiếp Tục <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Xác Thực OTP</h3>
                <p className="text-gray-500 text-sm mt-1">Mã xác thực đã được gửi đến <span className="font-semibold text-gray-700">{email}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã OTP (6 số)</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-phuhung-blue/20 focus:border-phuhung-blue outline-none transition-all tracking-[4px] font-bold text-center text-lg"
                    placeholder="------"
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-phuhung-orange hover:bg-phuhung-orangeHover text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/10 transition-all disabled:opacity-70"
              >
                {isLoading ? 'Đang kiểm tra...' : 'Xác Nhận & Đăng Nhập'}
              </button>
              
              <button 
                type="button"
                onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                className="w-full text-sm text-gray-500 hover:text-phuhung-blue mt-4"
              >
                Quay lại nhập Email
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
           <p className="text-xs text-gray-400">© 2025 Phu Hung Assurance</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;