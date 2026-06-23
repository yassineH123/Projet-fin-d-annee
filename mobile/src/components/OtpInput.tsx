import React, { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

type Props = {
  length?: number;
  value?: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
};

export default function OtpInput({ length = 6, value = '', onChange, onComplete }: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(Array.from({ length }, (_, index) => value[index] || ''));

  useEffect(() => {
    const next = Array.from({ length }, (_, index) => value[index] || '');
    setDigits(next);
  }, [length, value]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    const joined = next.join('');
    onChange(joined);

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (next.every(Boolean)) {
      onComplete?.(joined);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={1}
          style={{
            width: 48,
            height: 56,
            borderRadius: 14,
            backgroundColor: '#111827',
            borderWidth: 1,
            borderColor: '#334155',
            color: '#fff',
            textAlign: 'center',
            fontSize: 20,
            fontWeight: '700',
          }}
        />
      ))}
    </View>
  );
}
export {};
