import Typography from "@mui/material/Typography";

type Props = {
  minimum?: number | null;
  maximum?: number | null;
  currency?: string | null;
  hideWhenEmpty?: boolean;
  prefix?: string;
  locale?: string;
};

function amount(value: number, currency: string, locale?: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function JobSalary({
  minimum,
  maximum,
  currency: suppliedCurrency = "ZAR",
  hideWhenEmpty = false,
  prefix,
  locale,
}: Props) {
  const currency = suppliedCurrency || "ZAR";
  if (minimum == null && maximum == null && hideWhenEmpty) return null;
  if (minimum == null && maximum == null)
    return (
      <Typography variant="body2" color="text.secondary">
        Salary not disclosed
      </Typography>
    );
  const label =
    minimum != null && maximum != null
      ? `${amount(minimum, currency, locale)} – ${amount(maximum, currency, locale)}`
      : amount((minimum ?? maximum) as number, currency, locale);
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: prefix ? 400 : 600,
        ...(prefix
          ? { m: 0, fontSize: "0.75rem", color: "text.secondary" }
          : {}),
      }}
    >
      {prefix && <strong>{prefix}</strong>}
      {label}
    </Typography>
  );
}
