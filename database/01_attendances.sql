-- Bài: thêm bảng điểm danh
CREATE TABLE attendances (
    id INT PRIMARY KEY,
    registration_id INT NOT NULL,
    session_date DATE NOT NULL,
    present BOOLEAN NOT NULL,
    FOREIGN KEY (registration_id) REFERENCES registrations(id),
    UNIQUE (registration_id, session_date)
);

-- Quan hệ: registrations 1 - n attendances
