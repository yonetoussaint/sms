import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

export default function App() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(true);

  const inputDigit = (digit) => {
    if (overwrite) {
      setDisplay(digit === '.' ? '0.' : digit);
      setOverwrite(false);
    } else {
      if (digit === '.' && display.includes('.')) return;
      setDisplay(display === '0' && digit !== '.' ? digit : display + digit);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setOverwrite(true);
  };

  const toggleSign = () => {
    setDisplay((d) => (d.startsWith('-') ? d.slice(1) : '-' + d));
  };

  const percent = () => {
    setDisplay((d) => String(parseFloat(d) / 100));
  };

  const compute = (a, b, op) => {
    switch (op) {
      case '+':
        return a + b;
      case '−':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? 0 : a / b;
      default:
        return b;
    }
  };

  const inputOperator = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (nextOperator === '=') {
      if (operator && prevValue !== null) {
        const result = compute(prevValue, inputValue, operator);
        setDisplay(String(result));
        setPrevValue(null);
        setOperator(null);
        setOverwrite(true);
      }
      return;
    }

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = compute(prevValue, inputValue, operator);
      setDisplay(String(result));
      setPrevValue(result);
    }
    setOperator(nextOperator);
    setOverwrite(true);
  };

  const handlePress = (key) => {
    if (key === 'C') return clear();
    if (key === '±') return toggleSign();
    if (key === '%') return percent();
    if (['÷', '×', '−', '+', '='].includes(key)) return inputOperator(key);
    return inputDigit(key);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.displayWrap}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>
      <View style={styles.keypad}>
        {BUTTONS.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((key) => {
              const isWide = key === '0';
              const isOperator = ['÷', '×', '−', '+', '='].includes(key);
              const isTop = ['C', '±', '%'].includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.7}
                  style={[
                    styles.button,
                    isWide && styles.buttonWide,
                    isOperator && styles.buttonOperator,
                    isTop && styles.buttonTop,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isTop && styles.buttonTextDark,
                    ]}
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const BG = '#000000';
const KEY_DARK = '#1c1c1c';
const KEY_LIGHT = '#a5a5a5';
const KEY_ORANGE = '#ff9500';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    justifyContent: 'flex-end',
  },
  displayWrap: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'flex-end',
  },
  displayText: {
    color: '#ffffff',
    fontSize: 80,
    fontVariant: ['tabular-nums'],
  },
  keypad: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    height: 76,
    marginHorizontal: 4,
    backgroundColor: KEY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWide: {
    flex: 2.25,
    alignItems: 'flex-start',
    paddingLeft: 28,
  },
  buttonOperator: {
    backgroundColor: KEY_ORANGE,
  },
  buttonTop: {
    backgroundColor: KEY_LIGHT,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 32,
  },
  buttonTextDark: {
    color: '#000000',
  },
});
