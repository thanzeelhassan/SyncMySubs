(() => {
  const fileInput = document.getElementById("fileInput");
  const shiftInput = document.getElementById("shiftInput");
  const previewBtn = document.getElementById("previewBtn");
  const applyBtn = document.getElementById("applyBtn");
  const output = document.getElementById("output");

  let originalText = "";
  let originalName = "subtitles.srt";

  // Ensure shift input shows one decimal for integer values (e.g. 4 -> 4.0)
  function formatShiftDisplay() {
    const raw = shiftInput.value;
    if (raw === "" || raw == null) return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    if (Number.isInteger(n)) {
      // preserve a single decimal place for integers
      shiftInput.value = n.toFixed(1);
    }
  }

  shiftInput.addEventListener("blur", formatShiftDisplay);
  shiftInput.addEventListener("change", formatShiftDisplay);
  // initial format
  formatShiftDisplay();

  fileInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    originalName = f.name || originalName;
    const reader = new FileReader();
    reader.onload = () => {
      originalText = reader.result;
      output.value = originalText.slice(0, 2000);
    };
    reader.readAsText(f);
  });

  previewBtn.addEventListener("click", () => {
    if (!originalText) return alert("Choose an .srt file first");
    const shifted = shiftSrt(originalText, parseFloat(shiftInput.value) || 0);
    output.value = shifted.slice(0, 2000);
  });

  applyBtn.addEventListener("click", () => {
    if (!originalText) return alert("Choose an .srt file first");
    const shifted = shiftSrt(originalText, parseFloat(shiftInput.value) || 0);
    downloadText(shifted, originalName.replace(/\.srt$/i, "") + "_shifted.srt");
  });

  function downloadText(txt, filename) {
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Parse timestamp like 01:02:03,456 or 1:02:03.456
  function tsToMs(ts) {
    ts = ts.replace(",", ".");
    const m = ts.match(/(\d{1,2}):(\d{2}):(\d{2})\.(\d{1,3})/);
    if (!m) return 0;
    const h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const s = parseInt(m[3], 10);
    let ms = parseInt((m[4] + "000").slice(0, 3), 10);
    return (h * 3600 + min * 60 + s) * 1000 + ms;
  }

  function msToTs(ms) {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    ms -= h * 3600000;
    const m = Math.floor(ms / 60000);
    ms -= m * 60000;
    const s = Math.floor(ms / 1000);
    const rem = ms - s * 1000;
    return pad(h, 2) + ":" + pad(m, 2) + ":" + pad(s, 2) + "," + pad(rem, 3);
  }

  function pad(n, width) {
    const s = "000" + n;
    return s.slice(-width);
  }

  function shiftSrt(text, seconds) {
    const shiftMs = Math.round(seconds * 1000);
    // Regex to find SRT timestamp lines
    const re =
      /(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,\.]\d{1,3})/g;
    const out = text.replace(re, (match, p1, p2) => {
      const a = tsToMs(p1);
      const b = tsToMs(p2);
      const na = Math.max(0, a + shiftMs);
      const nb = Math.max(0, b + shiftMs);
      return msToTs(na) + " --> " + msToTs(nb);
    });
    return out;
  }
})();
