
        // ----------------------------------------------------
        // 1. CHỨC NĂNG CAROUSEL TRƯỢT MƯỢT VÒNG LẶP VÔ TẬN
        // ----------------------------------------------------
        let isAnimating = false; // Biến cờ (flag) để chống spam click gây lỗi giao diện

        function scrollRooms(direction) {
            // Nếu đang trong quá trình trượt thì bỏ qua lệnh click mới
            if (isAnimating) return; 
            isAnimating = true;

            const container = document.getElementById('roomsContainer');
            // Lấy độ rộng của 1 thẻ phòng (bao gồm cả khoảng cách margin/gap là 25px) để biết cần trượt đi bao xa
            const cardWidth = container.firstElementChild.offsetWidth + 25; 

            if (direction === 1) { 
                // TRƯỜNG HỢP: BẤM MŨI TÊN BÊN PHẢI (TRƯỢT TỚI)
                container.style.transition = 'transform 0.3s ease-in-out'; // Bật hiệu ứng mượt
                container.style.transform = `translateX(-${cardWidth}px)`; // Đẩy dải băng chuyền sang trái

                // Đợi 300ms cho hiệu ứng trượt kết thúc
                setTimeout(() => {
                    container.style.transition = 'none'; // Tắt hiệu ứng mượt
                    // Lấy thẻ phòng đầu tiên (đang bị khuất bên trái) chuyển xuống vị trí cuối cùng
                    container.appendChild(container.firstElementChild);
                    // Lập tức đưa dải băng chuyền về lại tọa độ 0 (do tắt hiệu ứng mượt nên người dùng không thấy bị giật)
                    container.style.transform = 'translateX(0)';
                    isAnimating = false; // Nhả cờ cho phép click tiếp
                }, 300);

            } else { 
                // TRƯỜNG HỢP: BẤM MŨI TÊN BÊN TRÁI (TRƯỢT LÙI)
                container.style.transition = 'none'; // Tắt hiệu ứng mượt
                // Lấy thẻ phòng cuối cùng đưa lên đầu danh sách trước
                container.prepend(container.lastElementChild);
                // Đồng thời đẩy băng chuyền sang trái (để giấu thẻ vừa đưa lên đi)
                container.style.transform = `translateX(-${cardWidth}px)`;

                // Delay 10ms để trình duyệt kịp Render lại giao diện
                setTimeout(() => {
                    container.style.transition = 'transform 0.3s ease-in-out'; // Bật lại hiệu ứng mượt
                    // Trượt băng chuyền về tọa độ 0 (giúp thẻ đầu tiên lộ diện mượt mà)
                    container.style.transform = 'translateX(0)';
                }, 10); 
                
                setTimeout(() => { isAnimating = false; }, 300);
            }
        }

        // ----------------------------------------------------
        // 2. CHỨC NĂNG ĐÓNG / MỞ BẢNG POPUP ĐẶT PHÒNG
        // ----------------------------------------------------
        
        // Hàm mở Popup
        function openModal(roomName) {
            // Lấy tên phòng (tham số) đập vào tiêu đề của bảng Popup
            document.getElementById('modalRoomName').innerText = 'Bảng đặt phòng: ' + roomName;
            // Hiển thị khung Popup (từ display: none thành display: flex)
            document.getElementById('bookingModal').style.display = 'flex';
        }

        // Hàm đóng Popup và Reset dữ liệu
        function closeModal() {
            // Ẩn khung Popup
            document.getElementById('bookingModal').style.display = 'none';
            
            // Xóa toàn bộ lựa chọn trong bảng (tìm các ô có class 'selected')
            document.querySelectorAll('.booking-table td.selected').forEach(cell => {
                cell.classList.remove('selected'); // Gỡ class màu cam
                cell.innerText = 'Trống';          // Trả lại chữ 'Trống'
            });
            
            // Đưa mặc định số lượng khách về 2 và tổng tiền về 0
            document.getElementById('guestCount').value = "2";
            document.getElementById('totalPrice').innerText = '0';
        }

        // Lặp qua tất cả thẻ phòng để gắn sự kiện: Hễ click vào phòng là gọi hàm openModal()
        document.querySelectorAll('.room-card').forEach(card => {
            card.addEventListener('click', function() {
                // Lấy tên phòng từ trong thẻ <h3> của chính thẻ được click
                const roomName = this.querySelector('h3').innerText;
                openModal(roomName);
            });
        });

        // Sự kiện hỗ trợ: Nếu người dùng click chuột ra vùng tối (nền đen mờ) bên ngoài bảng thì tự động đóng bảng
        window.onclick = function(event) {
            const modal = document.getElementById('bookingModal');
            if (event.target == modal) { closeModal(); }
        }

        // ----------------------------------------------------
        // 3. CHỨC NĂNG TÍNH TỔNG TIỀN VÀ PHỤ THU
        // ----------------------------------------------------
        function calculateTotal() {
            let total = 0;
            // Thu thập tất cả các ô trên bảng ĐANG ĐƯỢC CHỌN
            let selectedCells = document.querySelectorAll('.booking-table td.selected');
            
            // 3.1: Vòng lặp lấy giá trị 'data-price' của từng ô để cộng dồn vào tổng tiền
            selectedCells.forEach(cell => {
                total += parseInt(cell.getAttribute('data-price'));
            });
            
            // 3.2: Xử lý logic phụ thu số lượng khách
            let guestCount = parseInt(document.getElementById('guestCount').value);
            // Chỉ tính phụ thu NẾU khách có chọn giờ VÀ chọn số khách > 2
            if (selectedCells.length > 0 && guestCount > 2) {
                // Mỗi khách dư ra sẽ nhân với 50.000đ
                let surcharge = (guestCount - 2) * 50000;
                total += surcharge;
            }
            
            // 3.3: Định dạng số tiền (ví dụ: 500000 thành 500.000) và in ra thẻ HTML hiển thị
            document.getElementById('totalPrice').innerText = total.toLocaleString('vi-VN');
        }

        // ----------------------------------------------------
        // 4. CHỨC NĂNG CLICK CHỌN TỪNG Ô TRONG BẢNG GIỜ
        // ----------------------------------------------------
        // Lấy ra tất cả các ô có class 'available' (các ô được phép đặt)
        document.querySelectorAll('.booking-table td.available').forEach(cell => {
            // Lắng nghe sự kiện click cho từng ô
            cell.addEventListener('click', function() {
                
                // Toggle (Bật/Tắt): Nếu chưa có class 'selected' thì thêm vào, nếu có rồi thì gỡ ra
                this.classList.toggle('selected');
                
                // Đổi chữ hiển thị theo class hiện tại
                if (this.classList.contains('selected')) {
                    this.innerText = 'Đang chọn'; // Hiển thị Đang chọn
                } else {
                    this.innerText = 'Trống';     // Hủy chọn thì trả về Trống
                }
                
                // Bước quan trọng: Cứ mỗi lần thao tác click trên bảng xong, phải bắt hệ thống tính lại Tổng tiền
                calculateTotal();
            });
        });