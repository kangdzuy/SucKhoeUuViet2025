
import React from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CurrencyInput: React.FC<Props> = ({ value, onChange, className, placeholder, disabled }) => {
  // Format number to Vietnamese currency string (e.g. 1000000 => 1.000.000)
  // If value is 0, we can show empty string or '0' depending on UX. Here we show '' to allow placeholder.
  const displayValue = value ? new Intl.NumberFormat('vi-VN').format(value) : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get raw input
    const rawInput = e.target.value;

    // Remove all non-digit characters (keep only 0-9)
    // This effectively handles pasting formatted numbers like "10.000.000" -> "10000000"
    const cleanString = rawInput.replace(/\D/g, '');

    // Convert to number
    const numberValue = cleanString ? parseInt(cleanString, 10) : 0;

    onChange(numberValue);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

export default CurrencyInput;
