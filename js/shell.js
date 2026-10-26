const STORE_KEY = "sa1262-lms-runtime";

const ERRORS = {
  0: "No error",
  101: "Already initialized",
  201: "Invalid argument error",
  301: "Not initialized",
  403: "Element is read only",
  405: "Incorrect data type",
};

const READ_ONLY = new Set([
  "cmi.core.student_id",
  "cmi.core.student_name",
  "cmi.core.credit",
  "cmi.core.entry",
  "cmi.core.lesson_mode",
  "cmi.core.total_time",
  "cmi.core._children",
  "cmi.core.score._children",
]);

function blankAttempt() {
  return {
    cmi: {
      "cmi.core.student_id": "SA_1262",
      "cmi.core.student_name": "Mabuela, Koketso",
      "cmi.core.lesson_location": "",
      "cmi.core.credit": "credit",
      "cmi.core.lesson_status": "not attempted",
      "cmi.core.entry": "ab-initio",
      "cmi.core.score.raw": "",
      "cmi.core.score.min": "0",
      "cmi.core.score.max": "100",
      "cmi.core.total_time": "0000:00:00.00",
      "cmi.core.lesson_mode": "normal",
      "cmi.core.exit": "",
      "cmi.core.session_time": "",
      "cmi.core._children": "student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time",
      "cmi.core.score._children": "raw,min,max",
      "cmi.suspend_data": "",
    },
    statements: [],
    calls: [],
    launched: false,
  };
}

let runtime = loadRuntime();
let initialized = false;
let lastError = "0";

function loadRuntime() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!saved || !saved.cmi) return blankAttempt();
    return { ...blankAttempt(), ...saved, cmi: { ...blankAttempt().cmi, ...saved.cmi } };
  } catch (error) {
    return blankAttempt();
  }
}

function saveRuntime() {
  localStorage.setItem(STORE_KEY, JSON.stringify(runtime));
  updateTracker();
}

function logCall(method, detail, result) {
  runtime.calls.unshift({ method: method, detail: detail, result: result, at: new Date().toISOString() });
  runtime.calls = runtime.calls.slice(0, 8);
}

function addTime(base, extra) {
  const parse = (value) => {
    const parts = String(value || "0000:00:00").split(":");
    return (Number(parts[0]) || 0) * 3600 + (Number(parts[1]) || 0) * 60 + (Number(parts[2]) || 0);
  };
  const total = parse(base) + parse(extra);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);
  const pad = (value, size) => String(value).padStart(size, "0");
  return pad(hours, 4) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
}

window.API = {
  LMSInitialize() {
    if (initialized) {
      lastError = "101";
      logCall("LMSInitialize", "", "false");
      saveRuntime();
      return "false";
    }
    initialized = true;
    const cmi = runtime.cmi;
    cmi["cmi.core.entry"] = cmi["cmi.suspend_data"] ? "resume" : "ab-initio";
    if (!cmi["cmi.core.lesson_status"] || cmi["cmi.core.lesson_status"] === "not attempted") {
      cmi["cmi.core.lesson_status"] = "incomplete";
    }
    lastError = "0";
    logCall("LMSInitialize", "", "true");
    saveRuntime();
    return "true";
  },
  LMSFinish() {
    if (!initialized) {
      lastError = "301";
      logCall("LMSFinish", "", "false");
      saveRuntime();
      return "false";
    }
    runtime.cmi["cmi.core.total_time"] = addTime(runtime.cmi["cmi.core.total_time"], runtime.cmi["cmi.core.session_time"]);
    initialized = false;
    lastError = "0";
    logCall("LMSFinish", "", "true");
    saveRuntime();
    return "true";
  },
  LMSGetValue(element) {
    if (!initialized) {
      lastError = "301";
      return "";
    }
    if (element === "cmi.core.session_time" || element === "cmi.core.exit") {
      lastError = "404";
      return "";
    }
    if (!Object.prototype.hasOwnProperty.call(runtime.cmi, element)) {
      lastError = "201";
      return "";
    }
    lastError = "0";
    return runtime.cmi[element];
  },
  LMSSetValue(element, value) {
    if (!initialized) {
      lastError = "301";
      logCall("LMSSetValue", element, "false");
      saveRuntime();
      return "false";
    }
    if (READ_ONLY.has(element)) {
      lastError = "403";
      logCall("LMSSetValue", element + " = " + value, "false");
      saveRuntime();
      return "false";
    }
    if (element === "cmi.suspend_data" && String(value).length > 4096) {
      lastError = "405";
      logCall("LMSSetValue", "cmi.suspend_data (" + String(value).length + " chars)", "false");
      saveRuntime();
      return "false";
    }
    if (!Object.prototype.hasOwnProperty.call(runtime.cmi, element) && element !== "cmi.suspend_data") {
      lastError = "201";
      logCall("LMSSetValue", element, "false");
      saveRuntime();
      return "false";
    }
    runtime.cmi[element] = String(value);
    lastError = "0";
    logCall("LMSSetValue", element + " = " + trimLog(value), "true");
    saveRuntime();
    return "true";
  },
  LMSCommit() {
    if (!initialized) {
      lastError = "301";
      logCall("LMSCommit", "", "false");
      saveRuntime();
      return "false";
    }
    lastError = "0";
    logCall("LMSCommit", "", "true");
    saveRuntime();
    return "true";
  },
  LMSGetLastError() {
    return lastError;
  },
  LMSGetErrorString(code) {
    return ERRORS[code] || "Unknown error";
  },
  LMSGetDiagnostic(code) {
    return this.LMSGetErrorString(code || lastError);
  },
};

function trimLog(value) {
  const text = String(value);
  return text.length > 80 ? text.slice(0, 77) + "..." : text;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

window.addEventListener("message", (event) => {
  const sameOrigin = event.origin === location.origin || (location.protocol === "file:" && event.origin === "null");
  if (!sameOrigin || !event.data || event.data.source !== "sa1262-sco" || event.data.type !== "xapi") return;
  runtime.statements.unshift(event.data.statement);
  runtime.statements = runtime.statements.slice(0, 24);
  saveRuntime();
});

function briefMarkup() {
  return `<section class="brief"><p class="eyebrow">SCORM 1.2 package</p><h1>Say It Clearly</h1><p>A custom HTML, CSS, and JavaScript course for a feedback conversation. It publishes as one SCO: branching practice, a scored check, suspend and resume, and an xAPI statement for each meaningful action.</p><ul class="spec"><li>HTML, CSS, JavaScript</li><li>SCORM 1.2 runtime</li><li>xAPI statements</li><li>Mastery score 67</li><li>Responsive layout</li><li>WCAG 2.1 AA practices</li></ul><button class="btn btn-primary" type="button" id="launch">Launch course</button><p class="quiet">Koketso Mabuela · Application SA_1262. Zip the scorm folder and upload that archive to Moodle, Cornerstone, or SuccessFactors.</p></section>`;
}

function showPlayer(forceReload) {
  const pane = document.getElementById("player");
  if (!runtime.launched) {
    pane.innerHTML = briefMarkup();
    document.getElementById("launch").addEventListener("click", launch);
    return;
  }
  if (!forceReload && document.getElementById("sco")) return;
  pane.innerHTML = `<iframe id="sco" title="Say It Clearly, SCORM course" src="scorm/index.html?launch=${Date.now()}"></iframe>`;
}

function updateTracker() {
  const cmi = runtime.cmi;
  const status = cmi["cmi.core.lesson_status"];
  const rows = [
    ["Student", cmi["cmi.core.student_name"]],
    ["ID", cmi["cmi.core.student_id"]],
    ["Status", status],
    ["Score", cmi["cmi.core.score.raw"] === "" ? "—" : cmi["cmi.core.score.raw"] + " / 100"],
    ["Location", cmi["cmi.core.lesson_location"] || "—"],
    ["Entry", cmi["cmi.core.entry"]],
    ["Session", cmi["cmi.core.session_time"] || "—"],
    ["Total time", cmi["cmi.core.total_time"]],
    ["Suspend", cmi["cmi.suspend_data"] ? cmi["cmi.suspend_data"].length + " chars" : "—"],
  ]
    .map((row, index) => {
      const value = index === 2 ? `<dd class="status status-${escapeHtml(status).replace(/\s+/g, "-")}">${escapeHtml(row[1])}</dd>` : `<dd>${escapeHtml(row[1])}</dd>`;
      return `<div><dt>${row[0]}</dt>${value}</div>`;
    })
    .join("");
  const calls = runtime.calls.length
    ? runtime.calls
        .map((call) => `<li><strong>${escapeHtml(call.method)}</strong> ${escapeHtml(call.detail)} <em>${escapeHtml(call.result)}</em></li>`)
        .join("")
    : "<li>No calls yet.</li>";
  const statements = runtime.statements.length
    ? runtime.statements
        .map((statement) => {
          const verb = statement.verb.display["en-US"];
          const name = statement.object.definition.name["en-US"];
          let extra = "";
          if (statement.result && typeof statement.result.success === "boolean") {
            extra = statement.result.success ? " · success" : " · not success";
          }
          return `<li><strong>${escapeHtml(verb)}</strong> ${escapeHtml(name)}${extra}</li>`;
        })
        .join("")
    : "<li>No statements yet.</li>";
  document.getElementById("tracker").innerHTML = `<section><h2>SCORM data</h2><dl class="cmi">${rows}</dl></section><section><h2>Recent API calls</h2><ol class="log">${calls}</ol></section><section><h2>xAPI statements</h2><ol class="log">${statements}</ol></section>`;
}

function launch() {
  runtime.launched = true;
  showPlayer(true);
  saveRuntime();
}

function resetAttempt() {
  initialized = false;
  runtime = blankAttempt();
  saveRuntime();
  showPlayer(false);
}

document.getElementById("relaunch").addEventListener("click", launch);
document.getElementById("reset").addEventListener("click", resetAttempt);
showPlayer(false);
updateTracker();
