import { useState } from 'react'
import { ClubFilter } from '../components/ClubFilter'
import { EventList } from '../components/EventList'
import { PageContainer } from '../components/PageContainer'
import { SearchBar } from '../components/SearchBar'
import { clubs, events } from '../data'
import { filterEvents } from '../lib/events'

export function EventsPage() {
  // State tối thiểu: chỉ những gì người dùng nhập
  const [query, setQuery] = useState('')
  const [clubId, setClubId] = useState('')
  const [includePast, setIncludePast] = useState(false)
  const [now] = useState(() => new Date())

  // Dữ liệu suy ra: tính lại mỗi lần render từ state — KHÔNG useState, KHÔNG useEffect.
  // React Compiler tự nhớ kết quả nên không cần useMemo.
  const visibleEvents = filterEvents(events, { query, clubId, includePast }, now)

  return (
    <PageContainer>
      <h1>Lịch sự kiện</h1>
      <p className="mt-3 mb-8 max-w-[60ch] text-lg text-ink-muted">
        Học kỳ I, năm học 2026–2027. Sự kiện có nhãn <strong>Sắp hết chỗ</strong> chỉ còn dưới 20% số chỗ —
        đăng ký sớm nhé.
      </p>

      <search className="mb-6 grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-[2fr_1fr]">
        <SearchBar value={query} onChange={setQuery} />
        <ClubFilter clubs={clubs} value={clubId} onChange={setClubId} />
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={includePast}
            onChange={(e) => setIncludePast(e.target.checked)}
            className="size-4.5 accent-primary"
          />
          Hiện cả sự kiện đã diễn ra
        </label>
      </search>

      <p role="status" className="mb-4 text-sm text-ink-muted">
        Tìm thấy {visibleEvents.length} sự kiện
      </p>
      <EventList events={visibleEvents} now={now} />
    </PageContainer>
  )
}
