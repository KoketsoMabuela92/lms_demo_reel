function findScormAPI(win) {
  let current = win;
  for (let depth = 0; depth < 7; depth += 1) {
    try {
      if (current.API) return current.API;
    } catch (error) {
      return null;
    }
    if (!current.parent || current.parent === current) break;
    current = current.parent;
  }
  try {
    if (win.opener && win.opener.API) return win.opener.API;
  } catch (error) {
    return null;
  }
  return null;
}

function createFallbackAPI() {
  const key = "sa1262-sco-fallback";
  const blank = {
    "cmi.core.student_id": "SA_1262",
    "cmi.core.student_name": "Mabuela, Koketso",
    "cmi.core.lesson_status": "not attempted",
    "cmi.core.lesson_location": "",
    "cmi.core.credit": "credit",
    "cmi.core.entry": "ab-initio",
    "cmi.core.lesson_mode": "normal",
    "cmi.core.score.raw": "",
    "cmi.core.score.min": "0",
    "cmi.core.score.max": "100",
    "cmi.core.total_time": "0000:00:00",
    "cmi.suspend_data": "",
    "cmi.core.exit": "",
    "cmi.core.session_time": "",
  };
  let data = { ...blank };
  let initialized = false;
  let error = "0";
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved) data = { ...blank, ...saved };
  } catch (ignored) {
    data = { ...blank };
  }
  function save() {
    localStorage.setItem(key, JSON.stringify(data));
  }
  return {
    LMSInitialize() {
      if (initialized) {
        error = "101";
        return "false";
      }
      initialized = true;
      data["cmi.core.entry"] = data["cmi.suspend_data"] ? "resume" : "ab-initio";
      if (!data["cmi.core.lesson_status"] || data["cmi.core.lesson_status"] === "not attempted") {
        data["cmi.core.lesson_status"] = "incomplete";
      }
      error = "0";
      save();
      return "true";
    },
    LMSFinish() {
      initialized = false;
      error = "0";
      save();
      return "true";
    },
    LMSGetValue(element) {
      if (!initialized) {
        error = "301";
        return "";
      }
      if (Object.prototype.hasOwnProperty.call(data, element)) {
        error = "0";
        return data[element];
      }
      error = "201";
      return "";
    },
    LMSSetValue(element, value) {
      if (!initialized) {
        error = "301";
        return "false";
      }
      data[element] = String(value);
      error = "0";
      save();
      return "true";
    },
    LMSCommit() {
      if (!initialized) {
        error = "301";
        return "false";
      }
      error = "0";
      save();
      return "true";
    },
    LMSGetLastError() {
      return error;
    },
    LMSGetErrorString(code) {
      return code === "0" ? "No error" : "Error " + code;
    },
    LMSGetDiagnostic() {
      return "";
    },
  };
}

const SCORM = (function scormBridge() {
  const api = findScormAPI(window);
  const active = api || createFallbackAPI();
  const started = Date.now();
  return {
    offline: !api,
    initialize() {
      return active.LMSInitialize("") === "true";
    },
    get(element) {
      return active.LMSGetValue(element) || "";
    },
    set(element, value) {
      return active.LMSSetValue(element, String(value ?? "")) === "true";
    },
    commit() {
      return active.LMSCommit("") === "true";
    },
    finish() {
      return active.LMSFinish("") === "true";
    },
    sessionTime() {
      const total = Math.max(0, Math.floor((Date.now() - started) / 1000));
      const hours = Math.floor(total / 3600);
      const minutes = Math.floor((total % 3600) / 60);
      const seconds = total % 60;
      const pad = (value, size) => String(value).padStart(size, "0");
      return pad(hours, 4) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
    },
  };
})();
