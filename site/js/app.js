// Câu 2: viết JavaScript tại đây

const API_URL = 'http://localhost:4000';

// Hàm có sẵn: đổi giờ UTC sang giờ Việt Nam, vd "08:00 12/09/2026"
const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit', minute: '2-digit',
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

// Câu 2a: Hàm formatSeats(event) trả về "Còn 12/40 chỗ", hoặc "Hết chỗ" khi đã đủ
const formatSeats = (event) => {
  const capacity = Number(event?.capacity) || 0;
  const registeredCount = Number(event?.registeredCount) || 0;
  const remaining = capacity - registeredCount;
  if (remaining <= 0) {
    return 'Hết chỗ';
  }
  return `Còn ${remaining}/${capacity} chỗ`;
};

// Câu 2b: Hàm renderEvents(events) tạo card giống Câu 1 bằng createElement,
// gán dữ liệu bằng textContent/setAttribute, rồi thay nội dung cũ của #event-list bằng replaceChildren
const renderEvents = (events) => {
  const eventList = document.querySelector('#event-list');
  if (!eventList) return;

  const cards = events.map((event) => {
    const article = document.createElement('article');
    article.className = 'card';

    const img = document.createElement('img');
    img.setAttribute('src', 'img/event.svg');
    img.setAttribute('alt', event.name);

    const h3 = document.createElement('h3');
    const a = document.createElement('a');
    a.setAttribute('href', `event-detail.html?id=${event.id}`);
    a.textContent = event.name;
    h3.append(a);

    const timeP = document.createElement('p');
    const time = document.createElement('time');
    time.setAttribute('datetime', event.startTime);
    time.textContent = formatDateTime(event.startTime);
    timeP.append(time);

    const locationP = document.createElement('p');
    locationP.className = 'location';
    locationP.textContent = event.location;

    const seatsP = document.createElement('p');
    seatsP.className = 'seats';
    const seatInfo = formatSeats(event);
    if (seatInfo === 'Hết chỗ') {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Hết chỗ';
      seatsP.append(badge);
    } else {
      seatsP.textContent = seatInfo;
    }

    article.append(img, h3, timeP, locationP, seatsP);
    return article;
  });

  eventList.replaceChildren(...cards);
};

// Câu 2c: Hàm async loadEvents(keyword), gọi khi mở trang và khi gửi form
const loadEvents = async (keyword = '') => {
  const statusEl = document.querySelector('#status');
  const eventList = document.querySelector('#event-list');

  if (statusEl) {
    statusEl.textContent = 'Đang tải…';
  }

  const params = new URLSearchParams();
  const q = (keyword ?? '').trim();
  if (q !== '') {
    params.set('q', q);
  }
  params.set('pageSize', '50');

  try {
    const response = await fetch(`${API_URL}/api/events?${params.toString()}`);
    // Kiểm tra response.ok
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const events = data.items || [];
    const total = data.totalCount ?? events.length;

    renderEvents(events);

    if (statusEl) {
      if (total === 0) {
        statusEl.textContent = 'Không có sự kiện nào khớp từ khoá.';
      } else {
        statusEl.textContent = `Tìm thấy ${total} sự kiện`;
      }
    }
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = 'Không tải được dữ liệu, vui lòng thử lại.';
    }
    if (eventList) {
      eventList.replaceChildren();
    }
  }
};

const searchForm = document.querySelector('#search-form');
const keywordInput = document.querySelector('#keyword');

if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = keywordInput ? keywordInput.value.trim() : '';
    loadEvents(keyword);
  });
}

loadEvents();

window.formatSeats = formatSeats;
window.renderEvents = renderEvents;
window.loadEvents = loadEvents;
