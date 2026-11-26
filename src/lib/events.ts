import type { EventFilter, EventItem } from '../types'

export function seatsLeft(event: EventItem): number {
  return Math.max(0, event.capacity - event.registeredCount)
}

// "Sắp hết chỗ": còn chỗ nhưng ít hơn 20% sức chứa (quy ước từ Ch02)
export function isAlmostFull(event: EventItem): boolean {
  const left = seatsLeft(event)
  return left > 0 && left < event.capacity * 0.2
}

export function isPast(event: EventItem, now: Date): boolean {
  return new Date(event.startTime) < now
}

// Bỏ dấu tiếng Việt để gõ "hien mau" vẫn tìm được "Hiến máu"
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

// Hàm thuần: cùng đầu vào → cùng đầu ra. Component gọi trực tiếp lúc render,
// KHÔNG lưu kết quả vào state và KHÔNG cần useEffect.
export function filterEvents(events: EventItem[], filter: EventFilter, now: Date): EventItem[] {
  const query = normalize(filter.query)
  return events
    .filter((event) => filter.includePast || !isPast(event, now))
    .filter((event) => filter.clubId === '' || event.clubId === filter.clubId)
    .filter((event) => query === '' || normalize(event.name).includes(query))
    .toSorted((a, b) => a.startTime.localeCompare(b.startTime))
}
