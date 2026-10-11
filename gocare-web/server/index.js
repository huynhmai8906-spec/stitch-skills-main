const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MEDICAL_DISPATCH_GRAPH, findShortestPathDijkstra } = require('./algorithms/dijkstra');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Helper to read JSON
function readData(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

// Helper to write JSON
function writeData(filename, data) {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- 1. Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'GoCare 5-Star Medical Telemetry & Hospital EHR',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

// --- 2. Caregivers & Doctors ---
app.get('/api/caregivers', (req, res) => {
  const { specialty, location, role, search } = req.query;
  let list = readData('caregivers.json');

  if (specialty && specialty !== 'all') {
    list = list.filter(c => c.specialty === specialty);
  }
  if (location && location !== 'all') {
    list = list.filter(c => c.location === location);
  }
  if (role && role !== 'all') {
    list = list.filter(c => c.role.toLowerCase() === role.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.title.toLowerCase().includes(s) ||
      c.specialtyName.toLowerCase().includes(s)
    );
  }

  res.json({
    total: list.length,
    data: list
  });
});

app.get('/api/caregivers/:id', (req, res) => {
  const list = readData('caregivers.json');
  const found = list.find(c => c.id === req.params.id);
  if (!found) return res.status(404).json({ error: 'Không tìm thấy nhân sự y tế' });
  res.json(found);
});

// --- 3. GPS & Dijkstra Medical Dispatch Routing ---
app.get('/api/dispatch/nodes', (req, res) => {
  res.json({
    nodes: MEDICAL_DISPATCH_GRAPH.nodes,
    edges: MEDICAL_DISPATCH_GRAPH.edges
  });
});

app.get('/api/dispatch/route', (req, res) => {
  const start = req.query.start || 'thao-dien';
  const target = req.query.target || 'villas-thao-dien';

  if (!MEDICAL_DISPATCH_GRAPH.nodes[start] || !MEDICAL_DISPATCH_GRAPH.nodes[target]) {
    return res.status(400).json({ error: 'Mã điểm Node không hợp lệ' });
  }

  const result = findShortestPathDijkstra(start, target);
  res.json(result);
});

// --- 4. Bookings API ---
app.get('/api/bookings', (req, res) => {
  const bookings = readData('bookings.json');
  res.json({ total: bookings.length, data: bookings });
});

app.post('/api/bookings', (req, res) => {
  const {
    caregiverId,
    caregiverName,
    serviceType,
    shift,
    shiftName,
    patientName,
    contactPhone,
    address,
    startDate,
    notes,
    price
  } = req.body;

  if (!patientName || !contactPhone) {
    return res.status(400).json({ error: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ' });
  }

  const bookings = readData('bookings.json');
  const newBooking = {
    id: `BK-${1000 + bookings.length + 1}`,
    caregiverId: caregiverId || 'c1',
    caregiverName: caregiverName || 'Đội Ngũ Điều Dưỡng GoCare',
    serviceType: serviceType || 'Chăm sóc người cao tuổi',
    shift: shift || '8h',
    shiftName: shiftName || 'Ca 8 Giờ Tiêu Chuẩn',
    patientName,
    contactPhone,
    address: address || 'TP. Hồ Chí Minh',
    startDate: startDate || new Date().toISOString().split('T')[0],
    notes: notes || '',
    price: price || 720000,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(newBooking);
  writeData('bookings.json', bookings);

  res.status(201).json({
    message: 'Đặt lịch chăm sóc thành công! Điều phối viên y tế sẽ liên hệ trong vòng 3 phút.',
    booking: newBooking
  });
});

// --- 5. Reviews API ---
app.get('/api/reviews', (req, res) => {
  const reviews = readData('reviews.json');
  res.json({ total: reviews.length, data: reviews });
});

app.post('/api/reviews', (req, res) => {
  const { caregiverId, caregiverName, reviewerName, rating, comment } = req.body;
  if (!comment || !rating) {
    return res.status(400).json({ error: 'Vui lòng nhập nhận xét và số sao đánh giá' });
  }

  const reviews = readData('reviews.json');
  const newReview = {
    id: `rev-${reviews.length + 1}`,
    caregiverId: caregiverId || 'c1',
    caregiverName: caregiverName || 'ĐD. GoCare',
    reviewerName: reviewerName || 'Thân nhân người bệnh',
    relationship: 'Khách hàng GoCare',
    rating: Number(rating) || 5,
    comment,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  writeData('reviews.json', reviews);

  res.status(201).json({
    message: 'Cảm ơn quý gia đình đã đóng góp đánh giá lâm sàng!',
    review: newReview
  });
});

// --- 6. Patient EHR & Telemetry Vitals ---
app.get('/api/ehr/:patientId', (req, res) => {
  const ehrData = readData('ehr.json');
  const patient = ehrData.patients?.find(p => p.id === req.params.patientId);
  if (!patient) {
    return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh án' });
  }
  res.json(patient);
});

app.post('/api/ehr/:patientId/vitals', (req, res) => {
  const { bpSys, bpDia, heartRate, spO2, glucose, temp, note, recordedBy } = req.body;
  const ehrData = readData('ehr.json');
  const patient = ehrData.patients?.find(p => p.id === req.params.patientId);

  if (!patient) {
    return res.status(404).json({ error: 'Không tìm thấy bệnh nhân' });
  }

  const sys = Number(bpSys) || 120;
  const dia = Number(bpDia) || 80;
  let status = 'OPTIMAL';
  if (sys >= 140 || dia >= 90) status = 'WARNING';
  if (sys >= 160 || dia >= 100) status = 'CRITICAL';

  const newVital = {
    timestamp: new Date().toISOString(),
    bpSys: sys,
    bpDia: dia,
    heartRate: Number(heartRate) || 75,
    spO2: Number(spO2) || 98,
    glucose: Number(glucose) || 6.5,
    temp: Number(temp) || 36.6,
    recordedBy: recordedBy || 'Người nhà / Cảm biến radar',
    status,
    note: note || ''
  };

  patient.vitalsHistory.push(newVital);
  writeData('ehr.json', ehrData);

  res.status(201).json({
    message: 'Đã cập nhật chỉ số sinh tồn vào bệnh án điện tử EHR!',
    vital: newVital,
    currentStatus: status
  });
});

// --- 7. Pharmacy Products ---
app.get('/api/pharmacy', (req, res) => {
  const pharmacy = readData('pharmacy.json');
  res.json({ total: pharmacy.length, data: pharmacy });
});

// --- 8. AI Care Assistant (24/7 Clinical Triage & Empathy) ---
app.post('/api/ai/chat', (req, res) => {
  const { message, patientId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
  }

  const msg = message.toLowerCase();
  let reply = '';
  let alertLevel = 'NORMAL';
  let suggestedActions = [];

  // Clinical Triage Rules
  if (msg.includes('đau ngực') || msg.includes('khó thở') || msg.includes('ngất') || msg.includes('co giật') || msg.includes('160') || msg.includes('180')) {
    alertLevel = 'EMERGENCY';
    reply = '⚠️ CẢNH BÁO Y TẾ KHẨN: Triệu chứng bạn mô tả có dấu hiệu nguy cơ tim mạch hoặc tăng huyết áp kịch phát! Bác/Gia đình hãy cho người bệnh nằm đầu cao 30 độ, nới lỏng cổ áo và giữ bình tĩnh. Hệ thống đã kích hoạt phân luồng khẩn cấp đến Bác sĩ trực 24/7.';
    suggestedActions = [
      { text: 'Gọi Hotline Cấp Cứu 1900 6868', action: 'CALL_EMERGENCY' },
      { text: 'Kết nối Bác sĩ Tim mạch trực ca', action: 'DISPATCH_DOCTOR' }
    ];
  } else if (msg.includes('huyết áp') || msg.includes('140') || msg.includes('145') || msg.includes('150') || msg.includes('chóng mặt') || msg.includes('váng đầu')) {
    alertLevel = 'WARNING';
    reply = 'Bác và Gia đình ơi, huyết áp ở ngưỡng 140 - 150 mmHg là dấu hiệu tăng huyết áp độ I. Bác hãy ngồi nghỉ ngơi nơi yên tĩnh, hít sâu thở chậm bằng mũi theo nhịp 4-7-8, uống 1 ly nước ấm và đo lại sau 15 phút. GoCare đã tự động ghi nhận cảnh báo vào hồ sơ EHR.';
    suggestedActions = [
      { text: 'Hướng dẫn bài thở hạ áp 4-7-8', action: 'BREATHING_GUIDE' },
      { text: 'Đặt điều dưỡng đo sinh hiệu & ECG tại nhà', action: 'BOOK_NURSE' }
    ];
  } else if (msg.includes('uống thuốc') || msg.includes('thuốc') || msg.includes('quên')) {
    reply = 'Về lịch dùng thuốc: Cụ Trần Văn An hiện có đơn thuốc gồm Amlodipine 5mg (buổi sáng sau ăn) và Metformin 500mg. Nếu quên cữ sáng chưa quá 4 tiếng, Bác có thể uống ngay. Nếu đã gần cữ tiếp theo, tuyệt đối không uống gấp đôi liều mà hãy đợi cữ sau nhé!';
    suggestedActions = [
      { text: 'Xem đơn thuốc đầy đủ trên EHR', action: 'VIEW_EHR' },
      { text: 'Hỏi Dược sĩ lâm sàng GoCare', action: 'PHARMACY_CONSULT' }
    ];
  } else if (msg.includes('chào') || msg.includes('hello') || msg.includes('ai')) {
    reply = 'Kính chào Bác và Quý gia đình! Con là Trợ lý Sức Khỏe AI GoCare 24/7, luôn đồng hành phụng dưỡng bậc cao niên theo chuẩn mực y khoa 5 sao. Hôm nay Bác cảm thấy sức khỏe thế nào ạ? Bác có cần kiểm tra chỉ số hay tư vấn đặt ca điều dưỡng không?';
    suggestedActions = [
      { text: '🩺 Đánh giá chỉ số sức khỏe hôm nay', action: 'CHECK_VITALS' },
      { text: '📅 Đặt lịch điều dưỡng chăm sóc tại nhà', action: 'BOOK_CAREGIVER' },
      { text: '🌿 Tâm sự chia sẻ & Thư giãn tinh thần', action: 'EMPATHY_CHAT' }
    ];
  } else {
    reply = `Dạ con đã ghi nhận thông tin: "${message}". Đội ngũ y bác sĩ GoCare luôn sẵn lòng lắng nghe và hỗ trợ chăm sóc sức khỏe toàn diện. Bác hãy nhớ duy trì thói quen vận động nhẹ nhàng, uống đủ nước ấm và giữ tinh thần luôn an vui tĩnh tại nhé!`;
    suggestedActions = [
      { text: 'Đặt câu hỏi khác cho AI Care', action: 'ASK_MORE' },
      { text: 'Gặp Bác sĩ tư vấn 1:1', action: 'MEET_DOCTOR' }
    ];
  }

  res.json({
    reply,
    alertLevel,
    suggestedActions,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏥 GoCare 5-Star Healthcare Backend Server is RUNNING`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
