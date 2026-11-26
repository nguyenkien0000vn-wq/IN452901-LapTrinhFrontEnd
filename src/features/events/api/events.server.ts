import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { isApiError } from '../../../shared/api/api-error'
import { pagedSchema, type Paged } from '../../../shared/api/pagination'
import { serverFetch } from '../../../shared/api/server-fetch'
import { eventDtoSchema } from '../dto/event.dto'
import type { EventItem, EventQuery } from '../model/event'
import { toEvent, toEventQueryDto } from '../model/event.mapper'

// Dùng ở Server Component. DTO, Zod schema, mapper giữ nguyên từ Ch05 — chỉ đổi "đường ống" HTTP.
export async function getEvents(query: EventQuery): Promise<Paged<EventItem>> {
  'use cache'
  cacheLife('minutes')
  cacheTag('events')
  const page = await serverFetch('/api/events', pagedSchema(eventDtoSchema), { query: toEventQueryDto(query) })
  return { ...page, items: page.items.map(toEvent) }
}

export async function getEvent(id: string): Promise<EventItem | null> {
  'use cache'
  cacheLife('minutes')
  cacheTag('events', `event-${id}`)
  try {
    return toEvent(await serverFetch(`/api/events/${id}`, eventDtoSchema))
  } catch (error) {
    if (isApiError(error) && error.code === 'not_found') return null
    throw error
  }
}
