# API hủy đăng ký

## 1. Hủy phiếu đăng ký số 42

```http
DELETE /api/v1/registrations/42
```

Thành công: `204 No Content`.

## 2. Lấy các khóa còn chỗ, sắp xếp theo tên

```http
GET /api/v1/courses?hasSeats=true&sort=title
```

## 3. Phiếu không tồn tại

Trả về `404 Not Found`.
