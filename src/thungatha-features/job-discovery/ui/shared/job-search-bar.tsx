import { Search } from "lucide-react";

type JobSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  className: string;
  inputClassName?: string;
  element?: "label" | "div";
  name?: string;
  ariaLabel: string;
  placeholder: string;
  iconSize?: number;
  iconStrokeWidth?: number;
};

export function JobSearchBar({
  value,
  onChange,
  className,
  inputClassName,
  element = "label",
  name,
  ariaLabel,
  placeholder,
  iconSize = 17,
  iconStrokeWidth = 1.7,
}: JobSearchBarProps) {
  const content = (
    <>
      <Search aria-hidden="true" size={iconSize} strokeWidth={iconStrokeWidth} />
      <input
        aria-label={ariaLabel}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClassName}
      />
    </>
  );

  return element === "label" ? (
    <label className={className}>{content}</label>
  ) : (
    <div className={className}>{content}</div>
  );
}
