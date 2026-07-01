type EventType = 'landing_view' | 'pet_view' | 'adopt_click' | 'bounce';

const VISITOR_KEY = 'paw_visitor_id';
const SESSION_KEY = 'paw_session_id';
const LANDING_LOGGED_KEY = 'paw_landing_logged';
const BOUNCE_WINDOW_MS = 60 * 1000; // "vào rồi tắt trong vòng 1 phút" = rời đi

const uuid = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

// Sống lâu dài trong localStorage — đại diện 1 thiết bị/trình duyệt (unique visitor)
const getVisitorId = (): string => {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = uuid();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
};

// Mất khi đóng tab — dùng để gộp các sự kiện cùng 1 lượt ghé thăm
const getSessionId = (): string => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuid();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

export const trackEvent = (type: EventType, extra?: { petId?: string }) => {
  const token = localStorage.getItem('paw_token');
  fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      type,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      ...extra,
    }),
  }).catch(() => {});
};

// Gửi qua sendBeacon thay vì fetch — request khi trang đang bị đóng/ẩn dễ bị
// trình duyệt huỷ giữa chừng nếu dùng fetch, sendBeacon được đảm bảo gửi xong.
// Không đính kèm Authorization vì sendBeacon không cho set header tuỳ ý.
const sendBeaconEvent = (type: EventType) => {
  const payload = JSON.stringify({ type, visitorId: getVisitorId(), sessionId: getSessionId() });
  const blob = new Blob([payload], { type: 'application/json' });
  if (!navigator.sendBeacon?.('/api/logs', blob)) {
    fetch('/api/logs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
  }
};

const pageLoadedAt = Date.now();
let bounceTrackingInitialized = false;
let bounceSent = false;

// "Rời đi" = tab bị ẩn (đóng/chuyển tab/tắt trình duyệt) trong vòng
// BOUNCE_WINDOW_MS kể từ lúc trang được tải. Dùng visibilitychange thay vì
// beforeunload vì beforeunload không đáng tin cậy, đặc biệt trên mobile Safari.
// Áp dụng cho mọi trang, không riêng landing page.
export const initBounceTracking = () => {
  if (bounceTrackingInitialized) return;
  bounceTrackingInitialized = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden' || bounceSent) return;
    if (Date.now() - pageLoadedAt < BOUNCE_WINDOW_MS) {
      bounceSent = true;
      sendBeaconEvent('bounce');
    }
  });
};

// "Người dùng vào web" = hễ vào landing page ("/") là tính, không phân biệt
// đã đăng nhập hay chưa. Chỉ bắn 1 lần / tab để không đếm trùng khi quay lại
// trang chủ nhiều lần trong cùng 1 lượt ghé thăm.
export const trackLandingVisit = () => {
  if (sessionStorage.getItem(LANDING_LOGGED_KEY)) return;
  sessionStorage.setItem(LANDING_LOGGED_KEY, '1');
  trackEvent('landing_view');
};
