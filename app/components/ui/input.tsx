import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { value, onChange, className, ...rest } = props;

  // If a `value` is provided but no `onChange`, treat the input as readOnly
  // to avoid React throwing a production error for controlled inputs.
  const readOnly = value !== undefined && onChange === undefined ? true : props.readOnly;

  return <input className={(className || '') + ' border rounded px-2 py-1 w-full'} value={value} onChange={onChange} readOnly={readOnly} {...rest} />;
}
