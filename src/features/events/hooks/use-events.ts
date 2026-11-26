import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../api/events.api'
import type { EventQuery } from '../model/event'
import type { EventFormValues } from '../model/event-form.schema'

// Query key factory: mọi key của sự kiện sinh ra từ một chỗ → invalidate không gõ nhầm
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (query: EventQuery) => [...eventKeys.lists(), query] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
}

export function useEvents(query: EventQuery) {
  return useQuery({
    queryKey: eventKeys.list(query),
    // signal: rời trang hoặc đổi bộ lọc → TanStack Query huỷ request cũ
    queryFn: ({ signal }) => eventsApi.list(query, signal),
    placeholderData: keepPreviousData, // chuyển trang vẫn giữ danh sách cũ, không nhấp nháy
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: ({ signal }) => eventsApi.getById(id, signal),
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: EventFormValues) => eventsApi.create(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  })
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: EventFormValues) => eventsApi.update(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eventKeys.all }),
  })
}
