import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variantClass = variant === 'primary' ? 'btn-primary' : 
                       variant === 'destructive' ? 'btn-destructive' :
                       variant === 'outline' ? 'btn-outline' :
                       variant === 'ghost' ? 'btn-ghost' : '';

  return (
    <button className={`btn ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      className={`input-field ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export const Label = ({ className = '', children, ...props }) => (
  <label className={`label-text ${className}`} {...props}>
    {children}
  </label>
);
