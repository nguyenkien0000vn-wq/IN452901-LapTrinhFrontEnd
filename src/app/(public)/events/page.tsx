import type { Metadata } from 'next'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { getClubs } from '../../../features/clubs/api/clubs.server'
import { getEvents } from '../../../features/events/api/events.server'
import { EventFilters } from '../../../features/events/components/EventFilters'
import { EventList } from '../../../features/events/components/EventList'
import { totalPages } from '../../../shared/api/pagination'
import { startOfCurrentHour } from '../../../shared/lib/time'
import { PageContainer } from '../../../shared/ui/PageContainer'
import { Pagination } from '../../../shared/ui/Pagination'
import { Spinner } from '../../../shared/ui/Spinner'

export const metadata: Metadata = {
  title: 'Lịch sự kiện',
  description: 'Lịch sự kiện của các câu lạc bộ sinh viên Trường Đại học Đồng Tháp, học kỳ I năm học 2026–2027.',
}

const PAGE_SIZE = 9

export default function EventsPage({ searchParams }: PageProps<'/events'>) {
  return (
    <PageContainer>
      <h1>Lịch sự kiện</h1>
      <p className="mt-3 mb-8 max-w-[60ch] text-lg text-ink-muted">
        Học kỳ I, năm học 2026–2027. Sự kiện có nhãn <strong>Sắp hết chỗ</strong> chỉ còn dưới 20% số chỗ — đăng ký
        sớm nhé.
      </p>
      {/* searchParams là dữ liệu theo request → đọc bên trong Suspense, phần trên vẫn là HTML tĩnh */}
      <Suspense fallback={<Spinner label="Đang tải sự kiện…" />}>
        <EventsResults searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  )
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

async function EventsResults({ searchParams }: Pick<PageProps<'/events'>, 'searchParams'>) {
  const params = await searchParams
  const q = first(params.q)
  const clubId = first(params.clubId)
  const past = first(params.past) === '1'
  const page = Math.max(1, Number(first(params.page)) || 1)
  await connection()
  const now = new Date()

  const [events, clubs] = await Promise.all([
    getEvents({ q, clubId, from: past ? undefined : startOfCurrentHour(now), page, pageSize: PAGE_SIZE }),
    getClubs(),
  ])

  const hrefFor = (p: number) => {
    const next = new URLSearchParams({ q, clubId, past: past ? '1' : '', page: String(p) })
    for (const [key, value] of [...next]) if (!value) next.delete(key)
    return `/events?${next}`
  }

  return (
    <>
      <EventFilters clubs={clubs} q={q} clubId={clubId} past={past} />
      <p role="status" className="mb-4 text-sm text-ink-muted">
        Tìm thấy {events.totalCount} sự kiện
      </p>
      <EventList events={events.items} clubs={clubs} now={now} />
      <Pagination page={page} totalPages={totalPages(events)} hrefFor={hrefFor} />
    </>
  )
}
