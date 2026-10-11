import { api } from './api.js';

export function initBookingModule() {
  const modal = document.getElementById('bookingModal');
  const form = document.getElementById('booking-modal-form');
  const shiftSelect = document.getElementById('modalShiftSelect');
  const priceDisplay = document.getElementById('modalPriceDisplay');
  const doctorNameInput = document.getElementById('modalDoctorName');

  window.openBookingModal = function(caregiverName = 'ĐD. Hoàng Bích Ngọc', shift = '8h', price = 720000) {
    if (doctorNameInput) doctorNameInput.value = caregiverName;
    if (shiftSelect) shiftSelect.value = shift;
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    window.updateBookingPrice();
  };

  window.closeBookingModal = function() {
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.updateBookingPrice = function() {
    if (!shiftSelect || !priceDisplay) return;
    const opt = shiftSelect.options[shiftSelect.selectedIndex];
    const price = parseInt(opt.getAttribute('data-price') || '720000', 10);
    priceDisplay.textContent = price.toLocaleString('vi-VN') + ' VNĐ';
  };

  if (shiftSelect) {
    shiftSelect.addEventListener('change', window.updateBookingPrice);
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const patientName = document.getElementById('modalPatientName').value;
      const contactPhone = document.getElementById('modalPatientPhone').value;
      const address = document.getElementById('modalPatientAddress').value;
      const caregiverName = doctorNameInput.value;
      const shift = shiftSelect.value;
      const opt = shiftSelect.options[shiftSelect.selectedIndex];
      const price = parseInt(opt.getAttribute('data-price') || '720000', 10);
      const shiftName = opt.textContent.split(' - ')[0];

      try {
        const res = await api.createBooking({
          caregiverName,
          patientName,
          contactPhone,
          address,
          shift,
          shiftName,
          price
        });

        window.closeBookingModal();
        alert(res.message || 'Đặt lịch thành công! GoCare đã tiếp nhận yêu cầu.');
      } catch (err) {
        alert('Lỗi đặt lịch: ' + err.message);
      }
    });
  }

  // Review Modal
  const reviewModal = document.getElementById('reviewModal');
  window.openReviewModal = function(name = 'ĐD. Lê Vũ Anh Quân') {
    const targetNameEl = document.getElementById('reviewTargetName');
    if (targetNameEl) targetNameEl.textContent = 'Đang đánh giá ca trực cùng: ' + name;
    if (reviewModal) {
      reviewModal.classList.remove('hidden');
      reviewModal.classList.add('flex');
    }
  };

  window.closeReviewModal = function() {
    if (reviewModal) {
      reviewModal.classList.add('hidden');
      reviewModal.classList.remove('flex');
    }
  };

  window.submitReview = async function() {
    const commentEl = document.getElementById('reviewCommentInput');
    const comment = commentEl ? commentEl.value.trim() : '';
    if (!comment) {
      alert('Vui lòng nhập lời nhận xét lâm sàng!');
      return;
    }

    try {
      await api.createReview({
        caregiverName: 'ĐD. Lê Vũ Anh Quân',
        reviewerName: 'Gia đình người bệnh',
        rating: 5,
        comment
      });
      window.closeReviewModal();
      if (commentEl) commentEl.value = '';
      alert('Cảm ơn quý gia đình đã đóng góp đánh giá lâm sàng 5 sao GoCare!');
    } catch (err) {
      alert('Lỗi gửi đánh giá: ' + err.message);
    }
  };
}
