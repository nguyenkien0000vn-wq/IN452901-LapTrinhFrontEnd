type SearchBarProps = {
  value: string
  onChange: (value: string) => void
}

// Controlled input: giá trị lấy từ props, mỗi lần gõ báo ngược lên cha
export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="grid gap-1">
      <label htmlFor="search" className="font-semibold">
        Tìm theo tên
      </label>
      <input
        id="search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ví dụ: hiến máu, hackathon…"
        className="min-h-11 w-full rounded-sm border border-line bg-surface px-3 py-2 focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/35"
      />
    </div>
  )
}
