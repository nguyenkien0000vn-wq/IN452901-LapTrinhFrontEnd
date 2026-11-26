import { httpClient } from '../../../shared/api/http-client'
import { parseResponse } from '../../../shared/api/parse'
import { memberDtoSchema, tokenResponseSchema, type LoginRequestDto, type RegisterRequestDto } from '../dto/auth.dto'
import { toMember, type Member } from '../model/member'

export const authApi = {
  // Trả access token; refresh token server tự đặt vào cookie httpOnly (JS không đọc được)
  async login(body: LoginRequestDto): Promise<string> {
    const res = await httpClient.post('/api/auth/login', body)
    return parseResponse(tokenResponseSchema, res.data).accessToken
  },

  async register(body: RegisterRequestDto): Promise<Member> {
    const res = await httpClient.post('/api/auth/register', body)
    return toMember(parseResponse(memberDtoSchema, res.data))
  },

  // Dùng cookie refreshToken để xin access token mới
  async refresh(): Promise<string> {
    const res = await httpClient.post('/api/auth/refresh')
    return parseResponse(tokenResponseSchema, res.data).accessToken
  },

  async logout(): Promise<void> {
    await httpClient.post('/api/auth/logout')
  },

  async me(): Promise<Member> {
    const res = await httpClient.get('/api/members/me')
    return toMember(parseResponse(memberDtoSchema, res.data))
  },
}
