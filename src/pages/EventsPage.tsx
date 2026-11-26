import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ClubFilter } from '../features/clubs/components/ClubFilter'
import { useClubs } from '../features/clubs/hooks/use-clubs'
import { EventList } from '../features/events/components/EventList'
import { SearchBar } from '../features/events/components/SearchBar'
import { useEvents } from '../features/events/hooks/use-events'
import { totalPages } from '../shared/api/pagination'
import { ErrorState } from '../shared/ui/ErrorState'
import { PageContainer } from '../shared/ui/PageContainer'
import { Pagination } from '../shared/ui/Pagination'
import { Spinner } from '../shared/ui/Spinner'

const PAGE_SIZE = 9

export function EventsPage() {
  // Bộ lọc nằm trên URL: /events?q=hien+mau&clubId=…&page=2 — dán link là ra đúng kết quả
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const clubId = searchParams.get('clubId') ?? ''
  const includePast = searchParams.get('past') === '1'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [now] = useState(() => new Date())

  const events = useEvents({ q, clubId, from: includePast ? undefined : now, page, pageSize: PAGE_SIZE })
  const clubs = useClubs()

  // Đổi bộ lọc → về trang 1; giá trị rỗng thì bỏ khỏi URL cho gọn
  function updateParams(changes: Record<string, string>) {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('page' in changes)) next.delete('page')
    setSearchParams(next)
  }

  return (
    <PageContainer>
      <h1>Lịch sự kiện</h1>
      <p className="mt-3 mb-8 max-w-[60ch] text-lg text-ink-muted">
        Học kỳ I, năm học 2026–2027. Sự kiện có nhãn <strong>Sắp hết chỗ</strong> chỉ còn dưới 20% số chỗ — đăng ký
        sớm nhé.
      </p>

      <div className="mb-6 grid gap-4 rounded-md border border-line bg-surface p-4 sm:grid-cols-[2fr_1fr]">
        {/* key={q}: URL đổi (bấm Back) thì ô tìm kiếm hiện lại đúng từ khoá */}
        <SearchBar key={q} defaultValue={q} onSearch={(value) => updateParams({ q: value })} />
        <ClubFilter clubs={clubs.data ?? []} value={clubId} onChange={(value) => updateParams({ clubId: value })} />
        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={includePast}
            onChange={(e) => updateParams({ past: e.target.checked ? '1' : '' })}
            className="size-4.5 accent-primary"
          />
          Hiện cả sự kiện đã diễn ra
        </label>
      </div>

      {events.isPending ? (
        <Spinner label="Đang tải sự kiện…" />
      ) : events.isError ? (
        <ErrorState error={events.error} onRetry={() => events.refetch()} />
      ) : (
        <div className={events.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
          <p role="status" className="mb-4 text-sm text-ink-muted">
            Tìm thấy {events.data.totalCount} sự kiện
          </p>
          <EventList events={events.data.items} clubs={clubs.data ?? []} now={now} />
          <Pagination
            page={page}
            totalPages={totalPages(events.data)}
            onChange={(p) => updateParams({ page: String(p) })}
          />
        </div>
      )}
    </PageContainer>
  )
}
