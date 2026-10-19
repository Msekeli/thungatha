import Typography from "@mui/material/Typography";

type Props = {
  minimum?: number | null;
  maximum?: number | null;
  currency?: string | null;
};

function amount(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency", currency, maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function JobSalary({ minimum, maximum, currency: suppliedCurrency = "ZAR" }: Props) {\n  const currency = suppliedCurrency || "ZAR";
  if (minimum == null && maximum == null) {
    return <Typography variant="body2" color="text.secondary">Salary not disclosed</Typography>;
  }
  const label = minimum != null && maximum != null
    ? `${amount(minimum, currency)} – ${amount(maximum, currency)}`
    : amount((minimum ?? maximum) as number, currency);
  return <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>;
}
