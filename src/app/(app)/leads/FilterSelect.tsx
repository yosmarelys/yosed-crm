"use client";

export function FilterSelect({
  name,
  value,
  placeholder,
  options,
}: {
  name: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      onChange={(e) => {
        const url = new URL(window.location.href);
        if (e.target.value) url.searchParams.set(name, e.target.value);
        else url.searchParams.delete(name);
        window.location.href = url.toString();
      }}
      className="input h-[38px] w-44 !py-0 text-sm"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
