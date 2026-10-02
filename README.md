# Cognitive Mock Test

Trang thi thử Cognitive Test gồm 4 phần: Numerical (12 câu/10 phút), Verbal (15 câu/10 phút), Abstract (50 câu/10 phút), Critical Thinking (16 câu/12 phút).

Trang tĩnh, chỉ gồm `index.html`, không cần build hay backend.

Tính năng:

- Ghi tên người làm bài (nhập ở trang chính, trình duyệt tự nhớ).
- Tạm dừng và làm tiếp: bài đang làm được lưu sau mỗi câu, tải lại trang hoặc đóng tab vẫn làm tiếp được; đồng hồ dừng trong lúc rời đi.
- Nộp bài sớm để xem kết quả ngay; câu chưa làm tính là sai.
- Lịch sử: tối đa 500 lần làm, mỗi lần lưu đủ đề, đáp án đã chọn và thời gian từng câu để xem lại hoặc làm lại đúng đề đó. Có biểu đồ tiến bộ theo từng phần, lọc theo phần/người làm/mức độ, xóa, xuất/nhập file JSON.
- Ôn câu sai: gom các câu làm sai hoặc chưa làm thành một đề riêng; ôn đúng câu nào thì câu đó rời khỏi danh sách.

Dữ liệu chỉ lưu trên trình duyệt (tóm tắt trong `localStorage`, chi tiết trong IndexedDB), không gửi lên server. Xóa dữ liệu trình duyệt là mất lịch sử, trừ khi đã xuất file.

- Chạy thử trên máy: mở `index.html` bằng trình duyệt.
- Deploy: import repo này vào Vercel, Framework Preset chọn "Other", không cần Build Command.
