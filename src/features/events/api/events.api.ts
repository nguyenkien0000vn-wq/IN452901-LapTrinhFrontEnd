import { httpClient } from '../../../shared/api/http-client'
import { pagedSchema, type Paged } from '../../../shared/api/pagination'
import { parseResponse } from '../../../shared/api/parse'
import { eventDtoSchema } from '../dto/event.dto'
import type { EventItem, EventQuery } from '../model/event'
import type { EventFormValues } from '../model/event-form.schema'
import { toCreateEventDto, toEvent, toEventQueryDto } from '../model/event.mapper'

// Tầng api: biết URL và DTO; trả về MODEL cho tầng hook. Không biết gì về React.
export const eventsApi = {
  async list(query: EventQuery, signal?: AbortSignal): Promise<Paged<EventItem>> {
    const res = await httpClient.get('/api/events', { params: toEventQueryDto(query), signal })
    const page = parseResponse(pagedSchema(eventDtoSchema), res.data)
    return { ...page, items: page.items.map(toEvent) }
  },

  async getById(id: string, signal?: AbortSignal): Promise<EventItem> {
    const res = await httpClient.get(`/api/events/${id}`, { signal })
    return toEvent(parseResponse(eventDtoSchema, res.data))
  },

  async create(values: EventFormValues): Promise<EventItem> {
    const res = await httpClient.post('/api/events', toCreateEventDto(values))
    return toEvent(parseResponse(eventDtoSchema, res.data))
  },

  async update(id: string, values: EventFormValues): Promise<void> {
    await httpClient.put(`/api/events/${id}`, toCreateEventDto(values))
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`/api/events/${id}`)
  },
}
