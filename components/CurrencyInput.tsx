
import React, { useState, useEffect } from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CurrencyInput: React.FC<Props> = ({ value, onChange, className, placeholder, disabled }) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Sync with external value when not focused
  useEffect(() => {
    if (!isFocused) {
        setDisplayValue(value ? new Intl.NumberFormat('vi-VN').format(value) : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // While focused, allow free typing but filter for digits to keep it clean
    // We don't format here to prevent cursor jumping
    const rawVal = e.target.value;
    // Allow digits only (and maybe just keep it as string until blur)
    // If user types '1000', it shows '1000'. 
    // If user pastes '1.000', we should probably strip non-digits immediately to avoid confusion?
    // Let's strip non-digits to be safe, so input is always numeric digits during focus.
    const cleanVal = rawVal.replace(/\D/g, '');
    setDisplayValue(cleanVal);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // On focus, show raw number for easy editing
    // "1.000.000" -> "1000000"
    setDisplayValue(value ? value.toString() : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    const numVal = displayValue ? parseInt(displayValue, 10) : 0;
    
    // Only fire onChange if value actually changed
    if (numVal !== value) {
        onChange(numVal);
    }
    
    // Format for display
    setDisplayValue(numVal ? new Intl.NumberFormat('vi-VN').format(numVal) : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default CurrencyInput;
