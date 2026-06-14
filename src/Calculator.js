import React, { useState } from 'react';

function Calculator() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [result, setResult] = useState('');
  const [operator, setOperator] = useState('');

  const handleNum1Change = (e) => setNum1(e.target.value);
  const handleNum2Change = (e) => setNum2(e.target.value);
  const handleOperatorChange = (e) => setOperator(e.target.value);
  const handleCalculate = () => {
    if (operator === '+') {
      setResult(parseFloat(num1) + parseFloat(num2));
    } else if (operator === '-') {
      setResult(parseFloat(num1) - parseFloat(num2));
    } else if (operator === '*') {
      setResult(parseFloat(num1) * parseFloat(num2));
    } else if (operator === '/') {
      if (num2 !== '0') {
        setResult(parseFloat(num1) / parseFloat(num2));
      } else {
        setResult('Error: Division by zero');
      }
    }
  };

  return (
    <div>
      <input type='number' value={num1} onChange={handleNum1Change} />
      <select value={operator} onChange={handleOperatorChange}>
        <option value=''>Select an operator</option>
        <option value='+'>+</option>
        <option value='-'>-</option>
        <option value='*'>*</option>
        <option value='/'>/</option>
      </select>
      <input type='number' value={num2} onChange={handleNum2Change} />
      <button onClick={handleCalculate}>=</button>
      <p>Result: {result}</p>
    </div>
  );
}

export default Calculator;