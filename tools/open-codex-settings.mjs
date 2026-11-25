import { connect, pageTarget, localSocket } from '../extension/cdp.mjs';
const port = 19341;
const response = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000) });
if (!response.ok) throw new Error(`Codex debug endpoint returned HTTP ${response.status}`);
const targets = (await response.json()).filter(pageTarget);
if (!targets.length) throw new Error('Không tìm thấy cửa sổ Codex chính. Hãy mở Codex bằng shortcut Codex Perlica trước.');
let opened = false;
for (const target of targets) {
  const client = await connect(localSocket(target.webSocketDebuggerUrl, port));
  try {
    const result = await client.call('Runtime.evaluate', {
      expression: 'window.__aemeathExtension?.openSettings?.() ?? false',
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Settings UI failed');
    if (result.result?.value === true) opened = true;
  } finally { client.close(); }
}
if (!opened) throw new Error('Không tìm thấy Perlica renderer đã được nạp. Hãy đóng Codex hoàn toàn rồi mở lại bằng shortcut Codex Perlica.');
console.log('Codex Perlica Settings opened.');
