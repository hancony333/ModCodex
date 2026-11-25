// Minimal persistent MP4 wallpaper layer for the Codex main page.
// It leaves Codex DOM and controls intact; only the page background is changed.
export function installRenderer(payload) {
  if (window.top !== window) return { installed: false, reason: 'child-frame' };
  if (window.__aemeathExtension) return { installed: true, alreadyActive: true };

  const root = document.documentElement;
  const style = document.createElement('style');
  style.id = 'aemeath-video-wallpaper-style';
  style.textContent = payload.skin;
  (document.head || root).appendChild(style);

  const video = document.createElement('video');
  video.id = 'aemeath-perlica-wallpaper';
  video.autoplay = true; video.loop = true; video.muted = true; video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.src = payload.video;
  Object.assign(video.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center', zIndex: '0',
    pointerEvents: 'none', userSelect: 'none', opacity: '0.42'
  });

  function mount() { if (!video.isConnected) document.body?.prepend(video); }
  if (document.body) mount();
  const observer = new MutationObserver(mount);
  observer.observe(root, { childList: true, subtree: true });
  const play = () => video.play().catch(() => {});
  video.addEventListener('canplay', play, { once: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  root.setAttribute('data-aemeath-skin', '');

  const storageKey = 'aemeath-perlica-wallpaper-settings-v1';
  const defaults = { opacity: 42, brightness: 100, blur: 0, fit: 'cover', position: 'center' };
  let settings = { ...defaults };
  try { settings = { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; } catch {}

  function applySettings() {
    video.style.opacity = String(Math.max(0, Math.min(100, Number(settings.opacity))) / 100);
    video.style.filter = `brightness(${Math.max(30, Math.min(160, Number(settings.brightness)))}%) blur(${Math.max(0, Math.min(12, Number(settings.blur)))}px)`;
    video.style.objectFit = settings.fit === 'contain' ? 'contain' : 'cover';
    video.style.objectPosition = settings.position;
  }
  function saveSettings() {
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch {}
    applySettings();
  }
  applySettings();

  let panel;
  function openSettings() {
    if (!document.body) return false;
    if (panel?.isConnected) { panel.style.display = 'grid'; return true; }

    panel = document.createElement('div');
    panel.id = 'aemeath-perlica-settings';
    Object.assign(panel.style, {
      position: 'fixed', inset: '0', zIndex: '2147483647', display: 'grid',
      placeItems: 'center', padding: '20px', background: 'rgba(4, 7, 14, .72)',
      backdropFilter: 'blur(10px)', font: '14px/1.5 Segoe UI, sans-serif', color: '#f4f6fb'
    });
    const card = document.createElement('section');
    Object.assign(card.style, {
      width: 'min(440px, 100%)', boxSizing: 'border-box', padding: '24px',
      border: '1px solid rgba(160,190,230,.28)', borderRadius: '16px',
      background: 'linear-gradient(145deg, #182337, #0b111d)',
      boxShadow: '0 24px 80px rgba(0,0,0,.5)'
    });
    const heading = document.createElement('div');
    heading.textContent = 'PERLICA · WALLPAPER SETTINGS';
    Object.assign(heading.style, { fontSize: '12px', letterSpacing: '2px', color: '#9fc8ff', marginBottom: '6px' });
    const title = document.createElement('h2');
    title.textContent = 'Cài đặt nền';
    Object.assign(title.style, { fontSize: '23px', margin: '0 0 5px' });
    const intro = document.createElement('p');
    intro.textContent = 'Điều chỉnh Codex Trong cửa sổ chính Perlica Nền động. Thay đổi sẽ được tự động lưu trên máy.';
    Object.assign(intro.style, { color: '#b8c3d5', margin: '0 0 20px' });
    card.append(heading, title, intro);

    function addRange(labelText, key, min, max, suffix) {
      const wrap = document.createElement('label');
      Object.assign(wrap.style, { display: 'block', margin: '15px 0', color: '#e7edf7' });
      const line = document.createElement('span');
      Object.assign(line.style, { display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '7px' });
      const label = document.createElement('span'); label.textContent = labelText;
      const value = document.createElement('output'); value.textContent = `${settings[key]}${suffix}`;
      line.append(label, value);
      const input = document.createElement('input'); input.type = 'range'; input.min = String(min); input.max = String(max); input.step = '1'; input.value = String(settings[key]);
      Object.assign(input.style, { width: '100%', accentColor: '#8fc5ff', cursor: 'pointer' });
      input.addEventListener('input', () => { settings[key] = Number(input.value); value.textContent = `${input.value}${suffix}`; saveSettings(); });
      wrap.append(line, input); card.append(wrap);
    }
    addRange('Mức độ hiển thị của nền', 'opacity', 0, 100, '%');
    addRange('Độ sáng', 'brightness', 30, 160, '%');
    addRange('Mức độ mờ', 'blur', 0, 12, ' px');

    function addSelect(labelText, key, options) {
      const wrap = document.createElement('label');
      Object.assign(wrap.style, { display: 'block', margin: '15px 0', color: '#e7edf7' });
      const label = document.createElement('span'); label.textContent = labelText;
      Object.assign(label.style, { display: 'block', marginBottom: '7px' });
      const select = document.createElement('select');
      Object.assign(select.style, { width: '100%', padding: '9px', borderRadius: '8px', color: '#f4f6fb', background: '#26364d', border: '1px solid #526782' });
      for (const [value, text] of options) { const option = document.createElement('option'); option.value = value; option.textContent = text; select.append(option); }
      select.value = settings[key];
      select.addEventListener('change', () => { settings[key] = select.value; saveSettings(); });
      wrap.append(label, select); card.append(wrap);
    }
    addSelect('Cách điền nền', 'fit', [['cover', 'Lấp đầy cửa sổ (gợi ý)'], ['contain', 'Hiển thị đầy đủ']]);
    addSelect('Vị trí màn hình', 'position', [['center', 'Căn giữa'], ['top', 'Đỉnh'], ['bottom', 'đáy'], ['left', 'Bên trái'], ['right', 'Bên phải']]);

    const actions = document.createElement('div');
    Object.assign(actions.style, { display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '22px' });
    function button(text, primary, action) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
      Object.assign(b.style, { padding: '10px 14px', borderRadius: '9px', border: primary ? '1px solid #9bcaff' : '1px solid #526782', background: primary ? '#8fc5ff' : '#26364d', color: primary ? '#101b2b' : '#f4f6fb', fontWeight: '600', cursor: 'pointer' });
      b.addEventListener('click', action); return b;
    }
    actions.append(
      button('Khôi phục mặc định', false, () => { settings = { ...defaults }; saveSettings(); panel.remove(); panel = null; openSettings(); }),
      button('Hoàn thành', true, () => { panel.style.display = 'none'; })
    );
    card.append(actions); panel.append(card);
    panel.addEventListener('click', event => { if (event.target === panel) panel.style.display = 'none'; });
    document.body.append(panel);
    return true;
  }

  const onKeyDown = event => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'b') {
      event.preventDefault(); openSettings();
    }
    if (event.key === 'Escape' && panel?.isConnected) panel.style.display = 'none';
  };
  document.addEventListener('keydown', onKeyDown);

  const api = {
    dispose() {
      observer.disconnect(); video.pause(); video.removeAttribute('src'); video.load(); video.remove();
      style.remove(); panel?.remove(); document.removeEventListener('keydown', onKeyDown);
      root.removeAttribute('data-aemeath-skin'); delete window.__aemeathExtension;
    },
    start() { play(); return true; },
    startWhenSmooth() { play(); return Promise.resolve(true); },
    openSettings,
    status() { return { ready: true, completed: true, phase: 'wallpaper', settled: document.readyState === 'complete', overlay: false, wallpaper: true, video: true }; }
  };
  window.__aemeathExtension = api;
  window.__codexLocalWallpaper = api;
  play();
  return { installed: true, mode: 'video-wallpaper', video: 'perlica' };
}
