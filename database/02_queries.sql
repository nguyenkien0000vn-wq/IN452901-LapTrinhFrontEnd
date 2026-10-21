-- Câu 1: Các khóa học Nguyễn An đã đăng ký
SELECT c.title
FROM members m
JOIN registrations r ON m.id = r.member_id
JOIN courses c ON r.course_id = c.id
WHERE m.full_name = 'Nguyễn An';

-- Câu 2: Đếm số thành viên mỗi khóa, kể cả khóa trống
SELECT c.id, c.title, COUNT(r.id) AS so_thanh_vien
FROM courses c
LEFT JOIN registrations r ON c.id = r.course_id
GROUP BY c.id, c.title
ORDER BY COUNT(r.id) DESC;

-- Câu 3: Chuyển Lê Chi vào khóa Cơ sở dữ liệu bằng transaction
BEGIN;

INSERT INTO registrations(member_id, course_id)
SELECT m.id, c.id
FROM members m, courses c
WHERE m.full_name = 'Lê Chi'
  AND c.title = 'Cơ sở dữ liệu';

COMMIT;

-- Kiểm tra
SELECT * FROM registrations;
