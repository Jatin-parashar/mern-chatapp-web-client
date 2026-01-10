import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { type LucideIcon } from "lucide-react";

interface FormInputProps {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  title?: string;
  rightIcon?: React.ReactNode;
  helperText?: React.ReactNode;
  className?: string;
}

export const FormInput = ({
  id,
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled,
  minLength,
  maxLength,
  pattern,
  title,
  rightIcon,
  helperText,
  className
}: FormInputProps) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`pl-10 ${rightIcon ? 'pr-10' : ''} h-10 ${className || ''}`}
        required={required}
        disabled={disabled}
        minLength={minLength}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
      />
      {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</div>}
    </div>
    {helperText}
  </div>
);
