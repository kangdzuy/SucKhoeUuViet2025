
import React, { useState, useEffect } from 'react';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onValueChange: (val: number) => void;
}

const BufferedNumberInput: React.FC<Props> = ({ value, onValueChange, min, max, ...props }) => {
  const [localValue, setLocalValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
        // Handle 0 specifically. If value is 0, show '0' unless it's meant to be empty?
        // Usually strict number inputs show 0.
        setLocalValue(value !== undefined && value !== null ? value.toString() : '');
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const commit = () => {
    let val = localValue === '' ? 0 : parseFloat(localValue);
    if (isNaN(val)) val = 0;

    // Apply constraints
    if (min !== undefined && val < Number(min)) val = Number(min);
    if (max !== undefined && val > Number(max)) val = Number(max);

    if (val !== value) {
        onValueChange(val);
    }
    
    // Update local string to match the constrained value
    setLocalValue(val.toString());
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    commit();
    if (props.onBlur) props.onBlur(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) props.onFocus(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        (e.target as HTMLInputElement).blur();
    }
    if (props.onKeyDown) props.onKeyDown(e);
  };

  return (
    <input
      type="number"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      min={min}
      max={max}
      {...props}
    />
  );
};

export default BufferedNumberInput;
