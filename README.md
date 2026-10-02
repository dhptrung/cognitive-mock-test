# Cognitive Mock Test

Trang thi thử Cognitive Test gồm 4 phần: Numerical (12 câu/10 phút), Verbal (15 câu/10 phút), Abstract (50 câu/10 phút), Critical Thinking (16 câu/12 phút).

Giao diện là trang tĩnh `index.html`. Lịch sử được lưu lên server qua một API nhỏ `api/attempts.js` (Vercel Function + Vercel Blob).

Tính năng:

- Ghi tên người làm bài (nhập ở trang chính, trình duyệt tự nhớ).
- Tạm dừng và làm tiếp: bài đang làm được lưu sau mỗi câu, tải lại trang hoặc đóng tab vẫn làm tiếp được; đồng hồ dừng trong lúc rời đi.
- Nộp bài sớm để xem kết quả ngay; câu chưa làm tính là sai.
- Lịch sử: tối đa 500 lần làm, mỗi lần lưu đủ đề, đáp án đã chọn và thời gian từng câu để xem lại hoặc làm lại đúng đề đó. Có biểu đồ tiến bộ theo từng phần, lọc theo phần/người làm/mức độ, xóa, xuất/nhập file JSON.
- Mẹo làm bài: trang hướng dẫn từng dạng đề của cả 4 phần (8 dạng Numerical, 7 dạng Verbal, 10 dạng Abstract, 9 dạng Critical Thinking), mỗi dạng có ví dụ, lời giải từng bước và bẫy hay gặp.
- Bộ đề: Numerical sinh số liệu ngẫu nhiên từ 30 dạng câu; Verbal có 27 đoạn văn (100 statement); Abstract sinh ngẫu nhiên 5 dạng: dãy hình (7 thuộc tính: xoay, số cạnh, tô màu, số chấm, vị trí, kích thước, nét đứt), hai chuỗi xen kẽ, ma trận 3×3, chồng hình, tìm hình khác loại; Critical Thinking có 42 câu cố định cùng các dạng sinh ngẫu nhiên.
- Xem đề và đáp án theo dạng: Verbal và Critical Thinking hiện toàn bộ ngân hàng câu cố định kèm đáp án; Numerical và Abstract hiện 3 ví dụ mỗi dạng, bấm "Ví dụ khác" để sinh thêm.
- Ôn câu sai: gom các câu làm sai hoặc chưa làm thành một đề riêng; ôn đúng câu nào thì câu đó rời khỏi danh sách.

Lưu trữ:

- Mỗi lần làm được lưu trên máy (tóm tắt trong `localStorage`, chi tiết trong IndexedDB) và gửi lên server. Mất mạng thì bài nằm trong hàng đợi, tự gửi lại khi mở trang lần sau.
- Trên server mỗi lần làm là 2 file JSON trong Vercel Blob: `attempts/<id>.json` (đầy đủ đề và đáp án) và `summaries/<id>.json` (tóm tắt).
- Ai mở trang cũng xem được lịch sử của mọi người, gồm tên và kết quả. Chỉ máy đã gửi bài mới xóa được bài đó.
- Mở trực tiếp `index.html` (file://) thì chỉ lưu trên máy.

- Chạy thử trên máy: mở `index.html` bằng trình duyệt.
- Deploy lên Vercel:
  1. Import repo này vào Vercel, Framework Preset chọn "Other", để trống Build Command và Output Directory.
  2. Vào project → Storage → Create Database → Blob, chọn **Private**, rồi Connect vào project. Vercel tự thêm biến `BLOB_READ_WRITE_TOKEN`.
     Nếu tạo store loại Public thì thêm biến môi trường `BLOB_ACCESS=public`.
  3. Redeploy để API nhận biến môi trường.
