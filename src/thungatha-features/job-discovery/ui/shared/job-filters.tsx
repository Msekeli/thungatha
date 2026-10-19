type FilterOption = {
  label: string;
  value: string;
  count: number;
};

type JobFiltersProps = {
  query: string;
  location: string;
  typesSelected: string[];
  modesSelected: string[];
  salary: string;
  experience: string;
  types: FilterOption[];
  modes: FilterOption[];
  onQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onToggleType: (value: string) => void;
  onToggleMode: (value: string) => void;
  onSalaryChange: (value: string) => void;
  onExperienceChange: (value: string) => void;
  onClear: () => void;
  onApply: () => void;
};

export function JobFilters({
  query,
  location,
  typesSelected,
  modesSelected,
  salary,
  experience,
  types,
  modes,
  onQueryChange,
  onLocationChange,
  onToggleType,
  onToggleMode,
  onSalaryChange,
  onExperienceChange,
  onClear,
  onApply,
}: JobFiltersProps) {
  return (
    <div className="th-filter-content">
      <div className="th-filter-title">
        <strong>Filters</strong>
        <button type="button" onClick={onClear}>Clear all</button>
      </div>

      <label className="th-filter-label" htmlFor="th-job-search">Search</label>
      <div className="th-filter-search">
        <input
          id="th-job-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Job title, skills or company..."
        />
      </div>

      <label className="th-filter-label" htmlFor="th-location">Location</label>
      <div className="th-filter-select">
        <select
          id="th-location"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
        >
          <option>Cape Town + 50 km</option>
          <option>Cape Town</option>
          <option>Johannesburg</option>
          <option>Durban</option>
          <option>Remote</option>
          <option value="">Anywhere</option>
        </select>
      </div>

      <div className="th-filter-group">
        <strong>Job type</strong>
        {types.map((type) => (
          <label className="th-check-row" key={type.value}>
            <input
              type="checkbox"
              checked={typesSelected.includes(type.value)}
              onChange={() => onToggleType(type.value)}
            />
            <span>{type.label}</span>
            <small>{type.count}</small>
          </label>
        ))}
      </div>

      <div className="th-filter-group">
        <strong>Remote options</strong>
        {modes.map((mode) => (
          <label className="th-check-row" key={mode.value}>
            <input
              type="checkbox"
              checked={modesSelected.includes(mode.value)}
              onChange={() => onToggleMode(mode.value)}
            />
            <span>{mode.label}</span>
            <small>{mode.count}</small>
          </label>
        ))}
      </div>

      <label className="th-filter-label" htmlFor="th-salary">Salary range</label>
      <select
        id="th-salary"
        className="th-filter-native-select"
        value={salary}
        onChange={(event) => onSalaryChange(event.target.value)}
      >
        <option value="any">Any salary</option>
        <option value="disclosed">Salary disclosed</option>
        <option value="above50">R500,000+ per year</option>
      </select>

      <label className="th-filter-label" htmlFor="th-experience">Experience level</label>
      <select
        id="th-experience"
        className="th-filter-native-select"
        value={experience}
        onChange={(event) => onExperienceChange(event.target.value)}
      >
        <option value="any">Any level</option>
        <option value="entry">Entry level</option>
        <option value="mid">Mid-level</option>
        <option value="senior">Senior</option>
      </select>

      <button className="th-mobile-apply-filters" type="button" onClick={onApply}>
        Apply filters
      </button>
    </div>
  );
}
