'use server'

import { updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { isApiError } from '../../shared/api/api-error'
import { serverFetch } from '../../shared/api/server-fetch'
import { getSession } from '../auth/session.server'
import { eventDtoSchema } from './dto/event.dto'
import { eventFormSchema, type EventFormInput } from './model/event-form.schema'
import { eventFormFieldFromDto, toCreateEventDto } from './model/event.mapper'

export type EventFormState = {
  message?: string
  fieldErrors?: Partial<Record<keyof EventFormInput, string>>
  values?: Record<string, string>
}

export async function createEventAction(_prev: EventFormState, formData: FormData): Promise<EventFormState> {
  const session = await getSession()
  if (session?.role !== 'Admin') return { message: 'Chỉ Admin được tạo sự kiện.' }

  const values = Object.fromEntries(
    ['title', 'description', 'clubId', 'location', 'startAt', 'capacity'].map((k) => [k, String(formData.get(k) ?? '')]),
  )
  const parsed = eventFormSchema.safeParse({
    ...values,
    startAt: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(values.startAt) ? `${values.startAt}:00+07:00` : values.startAt,
    capacity: values.capacity === '' ? Number.NaN : Number(values.capacity),
  })
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors
    return {
      fieldErrors: Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v?.[0]])),
      values,
    }
  }

  try {
    await serverFetch('/api/events', eventDtoSchema, {
      method: 'POST',
      body: toCreateEventDto(parsed.data),
      token: session.token,
    })
  } catch (error) {
    if (!isApiError(error)) throw error
    const fieldErrors: EventFormState['fieldErrors'] = {}
    for (const [field, message] of Object.entries(error.fieldErrors)) {
      const formField = eventFormFieldFromDto[field as keyof typeof eventFormFieldFromDto]
      if (formField) fieldErrors[formField] = message
    }
    return { message: error.message, fieldErrors, values }
  }

  updateTag('events')
  redirect('/admin/events')
}

// Mẫu: Server Action xoá sự kiện (kiểm quyền → gọi API → updateTag)
export async function deleteEventAction(eventId: string): Promise<void> {
  const session = await getSession()
  if (session?.role !== 'Admin') throw new Error('Chỉ Admin được xoá sự kiện.')
  await serverFetch(`/api/events/${eventId}`, undefined, { method: 'DELETE', token: session.token })
  updateTag('events')
}
