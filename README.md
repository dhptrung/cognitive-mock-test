# Cognitive Mock Test

Trang thi thử Cognitive Test gồm 4 phần: Numerical (12 câu/10 phút), Verbal (15 câu/10 phút), Abstract (50 câu/10 phút), Critical Thinking (16 câu/12 phút).

Trang tĩnh, chỉ gồm `index.html`, không cần build hay backend.

Lịch sử làm bài lưu trong `localStorage` của trình duyệt: tối đa 500 lần làm (điểm từng phần, thời gian), trong đó 15 lần gần nhất giữ đủ chi tiết từng câu để xem lại. Mỗi lần làm ghi kèm tên người làm bài (nhập ở trang chính, trình duyệt tự nhớ). Trang Lịch sử có biểu đồ tiến bộ theo từng phần, lọc theo phần/người làm/mức độ, xóa, và xuất/nhập file JSON để chuyển sang máy khác.

- Chạy thử trên máy: mở `index.html` bằng trình duyệt.
- Deploy: import repo này vào Vercel, Framework Preset chọn "Other", không cần Build Command.
