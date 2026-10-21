# Câu hỏi tự kiểm tra

1. `member_id` là khóa ngoại, giúp ngăn việc đăng ký bằng một thành viên không tồn tại.

2. SQL đếm số đăng ký mỗi khóa, kể cả khóa trống:

```sql
SELECT c.id, c.title, COUNT(r.id) AS so_dang_ky
FROM courses c
LEFT JOIN registrations r ON c.id = r.course_id
GROUP BY c.id, c.title;
```

3. Tình huống cần transaction: chuyển một thành viên từ khóa này sang khóa khác. Các thao tác liên quan nên cùng thành công hoặc cùng thất bại.

4. MongoDB: nhúng khi dữ liệu nhỏ, thường dùng chung với document cha; tham chiếu khi dữ liệu lớn, được dùng ở nhiều nơi hoặc thay đổi độc lập.

5. Hủy đăng ký: `DELETE /api/v1/registrations/{id}`. Thành công: `204 No Content`. Đăng ký trùng: `409 Conflict`.
