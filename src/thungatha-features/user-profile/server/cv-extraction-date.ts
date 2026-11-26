export function createExperienceDateParser() {
  const month =
    "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
  const token = "(?:(?:" + month + "\\s+)?(?:19|20)\\d{2}|present|current)";
  const rangePattern = new RegExp(
    "(" + token + "\\s*(?:[-–—]|to)\\s*" + token + ")",
    "i",
  );
  const normalizeDate = (value: string) => {
    const match = value.match(
      new RegExp("^(" + month + ")\\s+((?:19|20)\\d{2})$", "i"),
    );
    if (!match) return /^(?:19|20)\d{2}$/.test(value) ? value : null;
    const months = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ];
    const number = months.indexOf(match[1].slice(0, 3).toLowerCase()) + 1;
    return match[2] + "-" + String(number).padStart(2, "0");
  };
  const parseRange = (value: string) => {
    const tokens =
      value.match(
        new RegExp(
          month + "\\s+(?:19|20)\\d{2}|(?:19|20)\\d{2}|present|current",
          "gi",
        ),
      ) ?? [];
    const dates = tokens
      .map((item) =>
        /present|current/i.test(item) ? item : normalizeDate(item),
      )
      .filter((item): item is string => Boolean(item));
    return {
      startDate: dates[0] ?? "",
      endDate: dates[1] && !/present|current/i.test(dates[1]) ? dates[1] : null,
      isCurrent: dates.some((item) => /present|current/i.test(item)),
    };
  };
  return { rangePattern, parseRange };
}
