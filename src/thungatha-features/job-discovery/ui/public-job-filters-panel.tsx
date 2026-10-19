"use client";

import { ChevronDown, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const types = [
  { label: "Full-time", value: "full_time" },
  { label: "Part-time", value: "part_time" },
  { label: "Contract", value: "contract" },
  { label: "Internships", value: "internship" },
  { label: "Learnerships", value: "learnership" },
  { label: "Graduate programmes", value: "graduate" },
];
const modes = [
  { label: "Remote", value: "remote" },
  { label: "Hybrid", value: "hybrid" },
  { label: "On-site", value: "onsite" },
];
export function PublicJobFiltersPanel({ query, setQuery, location, setLocation, typesSelected, setTypesSelected, modesSelected, setModesSelected, salary, setSalary, experience, setExperience, onClose, onClear }: {
  query: string; setQuery: (value: string) => void; location: string; setLocation: (value: string) => void;
  typesSelected: string[]; setTypesSelected: (value: string[]) => void;
  modesSelected: string[]; setModesSelected: (value: string[]) => void;
  salary: string; setSalary: (value: string) => void; experience: string; setExperience: (value: string) => void;
  onClose: () => void; onClear: () => void;
}) {
  const toggle = (values: string[], value: string, setter: (next: string[]) => void) =>
    setter(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);
  return <div className="th-filter-content">
    <div className="th-filter-title"><strong>Filters</strong><Button variant="ghost" size="sm" onClick={onClear}>Clear all</Button></div>
    <label className="th-filter-label" htmlFor="th-job-search">Search</label>
    <div className="th-filter-search"><Search size={15}/><input id="th-job-search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Job title, skills or company..."/></div>
    <label className="th-filter-label" htmlFor="th-location">Location</label>
    <div className="th-filter-select"><MapPin size={14}/><select id="th-location" value={location} onChange={event => setLocation(event.target.value)}><option>Cape Town + 50 km</option><option>Cape Town</option><option>Johannesburg</option><option>Durban</option><option>Remote</option><option value="">Anywhere</option></select><ChevronDown size={14}/></div>
    <div className="th-filter-group"><strong>Job type</strong>{types.map(item => <label className="th-check-row" key={item.value}><input type="checkbox" checked={typesSelected.includes(item.value)} onChange={() => toggle(typesSelected, item.value, setTypesSelected)}/><span>{item.label}</span>{item.count != null && <small>{item.count}</small>}</label>)}</div>
    <div className="th-filter-group"><strong>Remote options</strong>{modes.map(item => <label className="th-check-row" key={item.value}><input type="checkbox" checked={modesSelected.includes(item.value)} onChange={() => toggle(modesSelected, item.value, setModesSelected)}/><span>{item.label}</span><small>{item.count}</small></label>)}</div>
    <label className="th-filter-label" htmlFor="th-salary">Salary range</label>
    <select id="th-salary" className="th-filter-native-select" value={salary} onChange={event => setSalary(event.target.value)}><option value="any">Any salary</option><option value="disclosed">Salary disclosed</option><option value="above50">R500,000+ per year</option></select>
    <label className="th-filter-label" htmlFor="th-experience">Experience level</label>
    <select id="th-experience" className="th-filter-native-select" value={experience} onChange={event => setExperience(event.target.value)}><option value="any">Any level</option><option value="entry">Entry level</option><option value="mid">Mid-level</option><option value="senior">Senior</option></select>
    <Button className="th-mobile-apply-filters" variant="primary" block onClick={onClose}>Apply filters</Button>
  </div>;
}
