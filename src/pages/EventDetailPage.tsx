import { Link, useParams } from 'react-router'
import { PageContainer } from '../components/PageContainer'
import { findClub, findEvent, getClubImage } from '../data'
import { seatsLeft } from '../lib/events'
import { formatEventTime } from '../lib/format'
import { NotFoundPage } from './NotFoundPage'

export function EventDetailPage() {
  // :eventId trong route "events/:eventId" → đọc bằng useParams
  const { eventId = '' } = useParams()
  const event = findEvent(eventId)

  if (!event) return <NotFoundPage message="Không tìm thấy sự kiện này. Có thể đường dẫn đã sai." />

  const club = findClub(event.clubId)
  const left = seatsLeft(event)

  return (
    <PageContainer>
      <article className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:gap-x-8">
        <header className="lg:col-span-2">
          <Link to="/events" className="text-primary underline underline-offset-4">
            ← Quay lại lịch sự kiện
          </Link>
          <h1 className="mt-3">{event.name}</h1>
          {club && (
            <p className="mt-2 text-ink-muted">
              Do <strong className="text-ink">{club.name}</strong> tổ chức
            </p>
          )}
        </header>

        <div className="grid gap-6">
          <img
            src={getClubImage(event.clubId)}
            alt={`Biểu tượng ${club?.name ?? 'câu lạc bộ'}`}
            width={640}
            height={360}
            className="aspect-video w-full rounded-md object-cover"
          />
          <section aria-labelledby="noi-dung-su-kien">
            <h2 id="noi-dung-su-kien" className="mb-3">
              Nội dung
            </h2>
            <p>{event.description}</p>
          </section>
        </div>

        <section
          aria-labelledby="thong-tin"
          className="self-start rounded-md border border-line bg-surface p-6 shadow-md lg:sticky lg:top-24"
        >
          <h2 id="thong-tin" className="mb-4 text-xl">
            Thông tin chung
          </h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="font-semibold">Thời gian</dt>
            <dd>
              <time dateTime={event.startTime}>{formatEventTime(event.startTime)}</time>
            </dd>
            <dt className="font-semibold">Địa điểm</dt>
            <dd>{event.location}</dd>
            <dt className="font-semibold">Số chỗ</dt>
            <dd>
              {event.capacity} (còn {left} chỗ)
            </dd>
          </dl>
          <Link
            to="/register"
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-6 py-2 font-semibold text-on-primary hover:bg-primary-hover"
          >
            Đăng ký thành viên để giữ chỗ
          </Link>
        </section>
      </article>
    </PageContainer>
  )
}
