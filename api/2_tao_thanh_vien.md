# API tạo thành viên

## Request

```http
POST /api/v1/members
Content-Type: application/json
```

```json
{
  "fullName": "Nguyễn An",
  "email": "nguyenan@gmail.com"
}
```

## Thành công

```http
201 Created
Location: /api/v1/members/1
```

```json
{
  "id": 1,
  "fullName": "Nguyễn An",
  "email": "nguyenan@gmail.com"
}
```

## Email đã tồn tại

```http
409 Conflict
Content-Type: application/problem+json
```

```json
{
  "title": "Email đã tồn tại",
  "status": 409,
  "detail": "Email này đã được sử dụng"
}
```
