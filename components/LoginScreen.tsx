
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useLanguage, LanguageSwitcher } from '../services/languageService';

interface Props {
  onLoginSuccess: (email: string) => void;
}

const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(t('login.invalidEmail'));
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
      setError(`${t('login.invalidOtp')} (Gợi ý: 123456)`);
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 animate-enter">
        {/* Header */}
        <div className="bg-white p-8 pb-6 text-center border-b border-gray-100 relative overflow-visible">
           {/* Language Switcher Float */}
           <div className="absolute top-4 right-4">
               <div className="bg-phuhung-blue p-1 rounded-lg">
                  <LanguageSwitcher />
               </div>
           </div>

           <div className="flex justify-center mb-4 animate-enter" style={{ animationDelay: '100ms' }}>
             <img 
                src="https://www.baohiemphuhung.vn/assets/pac-logo-vn-BrmkJGw6.png" 
                alt="Phu Hung Assurance" 
                className="h-20 object-contain"
             />
           </div>
           <h2 className="text-lg font-bold text-phuhung-blue uppercase tracking-wide animate-enter" style={{ animationDelay: '200ms' }}>
               {t('login.title')}
           </h2>
        </div>

        {/* Form */}
        <div className="p-8 pt-6">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="text-center mb-6 animate-enter" style={{ animationDelay: '300ms' }}>
                <h3 className="text-lg font-bold text-gray-800">{t('common.login')}</h3>
                <p className="text-gray-500 text-sm mt-1">{t('login.subtitle')}</p>
              </div>

              <div className="space-y-4">
                <div className="relative animate-enter" style={{ animationDelay: '400ms' }}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue transition duration-150 ease-in-out sm:text-sm"
                    placeholder={t('login.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 animate-enter">
                     <span>⚠️</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-phuhung-blue hover:bg-phuhung-blueHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-phuhung-blue transition-all shadow-md hover:shadow-lg disabled:opacity-70 animate-enter"
                  style={{ animationDelay: '500ms' }}
                >
                  {isLoading ? t('common.processing') : t('common.continue')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
               <div className="text-center mb-6 animate-enter">
                <h3 className="text-lg font-bold text-gray-800">{t('login.otpTitle')}</h3>
                <p className="text-gray-500 text-sm mt-1">{t('login.otpSubtitle')} <b>{email}</b></p>
              </div>

              <div className="space-y-4">
                <div className="relative animate-enter" style={{ animationDelay: '100ms' }}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-phuhung-blue focus:border-phuhung-blue transition duration-150 ease-in-out sm:text-sm tracking-widest text-center font-bold text-lg"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2 animate-enter">
                     <span>⚠️</span> {error}
                  </div>
                )}

                <div className="flex gap-3 animate-enter" style={{ animationDelay: '200ms' }}>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all"
                  >
                    {t('login.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-phuhung-blue hover:bg-phuhung-blueHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-phuhung-blue transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                  >
                    {isLoading ? t('common.processing') : <>{t('common.login')} <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100 animate-enter" style={{ animationDelay: '600ms' }}>
           © 2025 Phu Hung Assurance. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
