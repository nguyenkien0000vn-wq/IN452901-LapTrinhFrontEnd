# Caching - kiến thức cơ bản

- Cache: lưu tạm dữ liệu để lần lấy sau nhanh hơn và giảm truy vấn database.
- Cache hit: tìm thấy dữ liệu trong cache.
- Cache miss: cache chưa có dữ liệu, phải lấy từ database rồi có thể lưu lại cache.
- Cache-aside: kiểm tra cache trước; nếu không có thì lấy database và đưa kết quả vào cache.
- TTL (Time To Live): thời gian dữ liệu cache tồn tại trước khi hết hạn.
- Invalidation: xóa/làm mất hiệu lực cache cũ khi dữ liệu gốc thay đổi.
- Cache stampede: nhiều request cùng cache miss và cùng truy vấn database.
- Redis: có thể dùng làm cache theo kiểu key-value.

Lệnh Redis cơ bản:

```text
SET courses "Danh sach khoa hoc"
GET courses
EXPIRE courses 60
```
