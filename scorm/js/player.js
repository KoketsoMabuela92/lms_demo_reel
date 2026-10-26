const PASS_COUNT = 2;

function defaultState() {
  return {
    slide: 0,
    visited: [],
    openedCards: [],
    clearFocus: "C",
    scenario: { current: "late", log: [] },
    quizAnswers: {},
    quizSubmitted: false,
    quizScore: null,
    bestScore: null,
    quizError: false,
    reflection: "",
    notes: false,
    sent: false,
  };
}

let state = defaultState();
let lastSlide = -1;
let closed = false;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function currentSlide() {
  return COURSE.slides[state.slide];
}

function moduleFor(slideId) {
  return COURSE.modules.find((mod) => mod.slides.includes(slideId));
}

function scenarioStats() {
  let strong = 0;
  state.scenario.log.forEach((beat) => {
    const node = COURSE.scenario.nodes[beat.nodeId];
    const choice = node && node.choices.find((item) => item.id === beat.choiceId);
    if (choice && choice.tone === "strong") strong += 1;
  });
  const last = state.scenario.log[state.scenario.log.length - 1];
  let finished = false;
  if (last) {
    const node = COURSE.scenario.nodes[last.nodeId];
    const choice = node && node.choices.find((item) => item.id === last.choiceId);
    finished = Boolean(choice && !choice.next);
  }
  return { strong: strong, beats: state.scenario.log.length, finished: finished };
}

function canContinue() {
  const slide = currentSlide();
  if (slide.type === "cards") return slide.cards.every((card) => state.openedCards.includes(card.id));
  if (slide.type === "scenario") return scenarioStats().finished;
  if (slide.type === "quiz" || slide.type === "summary") return state.quizSubmitted;
  return true;
}

function gateText() {
  const slide = currentSlide();
  if (canContinue()) return "";
  if (slide.type === "cards") return "Open each habit to continue.";
  if (slide.type === "scenario") return "Choose a response to continue.";
  if (slide.type === "quiz" && state.quizError) return "Choose an answer for each question.";
  if (slide.type === "quiz") return "Submit the check to continue.";
  return "Submit the knowledge check before you send a result.";
}

function suspendPayload() {
  return {
    slide: state.slide,
    visited: state.visited,
    openedCards: state.openedCards,
    clearFocus: state.clearFocus,
    scenario: state.scenario,
    quizAnswers: state.quizAnswers,
    quizSubmitted: state.quizSubmitted,
    quizScore: state.quizScore,
    bestScore: state.bestScore,
    reflection: state.reflection.slice(0, 240),
    sent: state.sent,
  };
}

function publish(mark) {
  const payload = JSON.stringify(suspendPayload());
  SCORM.set("cmi.suspend_data", payload);
  SCORM.set("cmi.core.lesson_location", currentSlide().id);
  const status = SCORM.get("cmi.core.lesson_status");
  if (status !== "passed" && status !== "failed") SCORM.set("cmi.core.lesson_status", "incomplete");
  if (state.bestScore !== null) {
    const raw = Math.round((state.bestScore / COURSE.questions.length) * 100);
    SCORM.set("cmi.core.score.min", "0");
    SCORM.set("cmi.core.score.max", "100");
    SCORM.set("cmi.core.score.raw", String(raw));
  }
  if (mark) SCORM.set("cmi.core.session_time", SCORM.sessionTime());
  SCORM.commit();
}

function restore() {
  const raw = SCORM.get("cmi.suspend_data");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    state = { ...defaultState(), ...saved, notes: false, quizError: false };
    state.slide = Math.max(0, Math.min(state.slide || 0, COURSE.slides.length - 1));
  } catch (error) {
    state = defaultState();
  }
}

function learnerFirstName() {
  const stored = SCORM.get("cmi.core.student_name") || "Mabuela, Koketso";
  const parts = stored.split(",");
  return (parts[1] || parts[0] || "there").trim();
}

function render() {
  const slide = currentSlide();
  const slideChanged = lastSlide !== state.slide;
  document.title = slide.title + " · Say It Clearly";
  document.getElementById("course").innerHTML = renderPlayer();
  if (slideChanged) {
    if (lastSlide !== -1) XAPI.experienced(slide);
    const main = document.getElementById("main");
    if (main) main.focus();
  }
  lastSlide = state.slide;
}

function renderPlayer() {
  const slide = currentSlide();
  const mod = moduleFor(slide.id);
  const ratio = Math.round((state.visited.length / COURSE.slides.length) * 100);
  const primary = primaryAction();
  const offline = SCORM.offline
    ? `<p class="banner">Standalone preview. SCORM data stays in this browser. Launch it from the sample LMS to see the runtime.</p>`
    : "";
  const modules = COURSE.modules
    .map((item) => {
      const here = item.id === mod.id;
      const count = item.slides.length;
      const label = count + " " + (count === 1 ? "screen" : "screens");
      const screens = here
        ? `<div class="screens">${item.slides
            .map((id) => {
              const index = COURSE.slides.findIndex((entry) => entry.id === id);
              const current = index === state.slide ? ' aria-current="true"' : "";
              return `<button type="button" data-action="jump" data-index="${index}"${current}>${escapeHtml(COURSE.slides[index].short)}</button>`;
            })
            .join("")}</div>`
        : "";
      return `<div><button class="mod${here ? " is-current" : ""}" type="button" data-action="jump-module" data-module="${item.id}"><span>${item.num}</span><span><strong>${escapeHtml(item.title)}</strong><small>${label}</small></span></button>${screens}</div>`;
    })
    .join("");

  return `
    ${offline}
    <div class="player">
      <aside class="rail">
        <p class="brand">Say It Clearly</p>
        <nav aria-label="Modules">${modules}</nav>
      </aside>
      <header class="topbar">
        <p>${escapeHtml(mod.title)}</p>
        <button class="btn btn-ghost" type="button" data-action="toggle-notes" aria-pressed="${state.notes ? "true" : "false"}">Build notes</button>
      </header>
      <div class="bar" aria-hidden="true"><span style="width:${ratio}%"></span></div>
      <main id="main" class="stage" tabindex="-1">
        <article class="slide">${renderSlide(slide)}</article>
        ${state.notes ? `<aside class="notes"><p class="eyebrow">Build notes</p><p>${escapeHtml(slide.note)}</p></aside>` : ""}
      </main>
      <footer class="foot">
        <p class="gate" ${slide.type === "quiz" && state.quizError ? 'role="alert"' : ""}>${escapeHtml(gateText())}</p>
        <p class="count">Screen ${state.slide + 1} of ${COURSE.slides.length}</p>
        <div class="foot-actions">
          <button class="btn btn-ghost" type="button" data-action="prev" ${state.slide === 0 ? "disabled" : ""}>Back</button>
          <button class="btn btn-primary" type="button" data-action="${primary.action}" ${primary.disabled ? "disabled" : ""}>${primary.label}</button>
        </div>
      </footer>
    </div>`;
}

function primaryAction() {
  const slide = currentSlide();
  if (slide.type === "quiz" && !state.quizSubmitted) return { action: "submit-quiz", label: "Submit answers", disabled: false };
  if (slide.type === "summary") return { action: "finish", label: state.sent ? "Result sent" : "Send result to LMS", disabled: !state.quizSubmitted || state.sent };
  return { action: "next", label: "Continue", disabled: !canContinue() };
}

function renderSlide(slide) {
  const head = `<p class="eyebrow">${escapeHtml(slide.kicker)}</p><h1>${escapeHtml(slide.title)}</h1>`;
  if (slide.type === "welcome") {
    const points = slide.points
      .map((point) => `<li><span>${escapeHtml(point.label)}</span><strong>${escapeHtml(point.value)}</strong></li>`)
      .join("");
    return `${head}<p class="lede">Hello ${escapeHtml(learnerFirstName())}. ${escapeHtml(slide.body)}</p><ul class="sticker">${points}</ul><details><summary>Narration transcript</summary><p>Feedback is a work skill, not a personality trait. This course takes about ten minutes. You will practise one conversation and take a three-question check. Your place is saved by the LMS.</p></details>`;
  }
  if (slide.type === "objectives") {
    const items = slide.items.map((item, index) => `<li><span>0${index + 1}</span><p>${escapeHtml(item)}</p></li>`).join("");
    return `${head}<ol class="objectives">${items}</ol>`;
  }
  if (slide.type === "cards") {
    const cards = slide.cards
      .map((card) => {
        const open = state.openedCards.includes(card.id);
        return `<button class="habit${open ? " is-open" : ""}" type="button" data-action="toggle-card" data-id="${card.id}" aria-expanded="${open ? "true" : "false"}"><span class="kicker">${open ? "Open" : "Closed"}</span><strong>${escapeHtml(card.title)}</strong><span>${escapeHtml(open ? card.body : card.teaser)}</span></button>`;
      })
      .join("");
    return `${head}<p>${escapeHtml(slide.prompt)}</p><div class="habits">${cards}</div>`;
  }
  if (slide.type === "model") {
    const steps = slide.steps
      .map((step) => {
        const open = state.clearFocus === step.id;
        return `<button class="ingredient${open ? " is-open" : ""}" type="button" data-action="focus-clear" data-id="${step.id}" aria-expanded="${open ? "true" : "false"}"><span class="letter">${step.id}</span><span><strong>${escapeHtml(step.name)}</strong>${open ? `<em>“${escapeHtml(step.say)}”</em><small>${escapeHtml(step.why)}</small>` : ""}</span></button>`;
      })
      .join("");
    return `${head}<p>${escapeHtml(slide.body)}</p><div class="ingredients">${steps}</div>`;
  }
  if (slide.type === "contrast") {
    return `${head}<p>${escapeHtml(slide.body)}</p><div class="pair">${quoteBlock(slide.weak, "weak")}${quoteBlock(slide.strong, "strong")}</div>`;
  }
  if (slide.type === "scenario") return `${head}<p>${escapeHtml(slide.body)}</p>${renderScenario()}`;
  if (slide.type === "quiz") return `${head}<p>${escapeHtml(slide.body)} Pass mark: ${PASS_COUNT} of ${COURSE.questions.length}.</p>${renderQuiz()}`;
  if (slide.type === "reflect") {
    return `${head}<p>${escapeHtml(slide.body)}</p><label for="reflection">${escapeHtml(slide.prompt)}</label><textarea id="reflection" maxlength="240">${escapeHtml(state.reflection)}</textarea>`;
  }
  const stats = scenarioStats();
  const score = state.quizSubmitted ? `${state.bestScore} of ${COURSE.questions.length}` : "Not submitted";
  const passed = (state.bestScore || 0) >= PASS_COUNT;
  const objectives = COURSE.slides.find((item) => item.id === "objectives").items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `${head}<p class="lede">${escapeHtml(slide.body)}</p><dl class="stats"><div><dt>Best check</dt><dd>${score}</dd></div><div><dt>Result</dt><dd>${state.quizSubmitted ? (passed ? "Meets the pass mark" : "Below the pass mark") : "Waiting"}</dd></div><div><dt>Practice</dt><dd>${stats.beats ? stats.strong + " strong of " + stats.beats : "Not taken"}</dd></div></dl><ul class="objectives">${objectives}</ul><p class="quiet">${state.sent ? "The LMS has the score, status, and xAPI result." : "Send the result to write the SCORM score and status."}</p>`;
}

function quoteBlock(block, tone) {
  const notes = block.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
  return `<article class="quote quote-${tone}"><p class="eyebrow">${escapeHtml(block.label)}</p><blockquote>${escapeHtml(block.quote)}</blockquote><ul>${notes}</ul></article>`;
}

function renderScenario() {
  const stats = scenarioStats();
  const transcript = state.scenario.log
    .map((beat) => {
      const node = COURSE.scenario.nodes[beat.nodeId];
      const choice = node.choices.find((item) => item.id === beat.choiceId);
      const label = choice.tone === "strong" ? "Strong move" : "Worth a revise";
      return `<li><p class="speaker">${escapeHtml(node.speaker)}</p><p>${escapeHtml(node.line)}</p><p class="speaker">You said</p><blockquote>${escapeHtml(choice.text)}</blockquote><p class="feedback feedback-${choice.tone}"><strong>${label}.</strong> ${escapeHtml(choice.feedback)}</p></li>`;
    })
    .join("");
  const current = COURSE.scenario.nodes[state.scenario.current];
  const answered = state.scenario.log.some((beat) => beat.nodeId === current.id);
  const live = answered
    ? `<div class="end-row"><p>Replay to take the other opening.</p><button class="btn btn-ghost" type="button" data-action="reset-scenario">Replay conversation</button></div>`
    : `<section><p class="speaker">${escapeHtml(current.speaker)}</p><p>${escapeHtml(current.line)}</p><p><strong>${escapeHtml(current.prompt)}</strong></p><div class="choices">${current.choices
        .map(
          (choice, index) =>
            `<button class="choice" type="button" data-action="choose" data-id="${choice.id}"><span>${String.fromCharCode(65 + index)}</span><span>${escapeHtml(choice.text)}</span></button>`
        )
        .join("")}</div></section>`;
  const tally = stats.beats ? `<p class="quiet">Strong moves so far: ${stats.strong} of ${stats.beats}.</p>` : "";
  return `${tally}<ol class="transcript">${transcript}</ol>${live}`;
}

function renderQuiz() {
  const questions = COURSE.questions
    .map((question, index) => {
      const selected = state.quizAnswers[question.id];
      const options = question.options
        .map((option) => {
          let tone = "";
          if (state.quizSubmitted && selected === option.id && option.id === question.answer) tone = "is-strong";
          if (state.quizSubmitted && selected === option.id && option.id !== question.answer) tone = "is-revise";
          if (state.quizSubmitted && option.id === question.answer) tone = tone || "is-key";
          return `<label class="choice ${tone}"><input type="radio" name="quiz-${question.id}" value="${option.id}" ${selected === option.id ? "checked" : ""} ${state.quizSubmitted ? "disabled" : ""} /><span>${escapeHtml(option.text)}</span></label>`;
        })
        .join("");
      const feedback = state.quizSubmitted
        ? `<p class="feedback ${selected === question.answer ? "feedback-strong" : "feedback-revise"}">${escapeHtml(question.why)}</p>`
        : "";
      return `<fieldset><legend>${index + 1}. ${escapeHtml(question.prompt)}</legend>${options}${feedback}</fieldset>`;
    })
    .join("");
  const result = state.quizSubmitted
    ? `<div class="end-row"><p>This attempt: ${state.quizScore} of ${COURSE.questions.length}. Best: ${state.bestScore} of ${COURSE.questions.length}.</p><button class="btn btn-ghost" type="button" data-action="retry-quiz">Retry check</button></div>`
    : "";
  return `<div class="quiz">${questions}</div>${result}`;
}

function goSlide(index) {
  if (index < 0 || index >= COURSE.slides.length) return;
  state.slide = index;
  if (!state.visited.includes(currentSlide().id)) state.visited.push(currentSlide().id);
  publish(false);
  render();
}

function submitQuiz() {
  const missing = COURSE.questions.some((question) => !state.quizAnswers[question.id]);
  if (missing) {
    state.quizError = true;
    render();
    return;
  }
  state.quizError = false;
  state.quizSubmitted = true;
  state.quizScore = COURSE.questions.filter((question) => state.quizAnswers[question.id] === question.answer).length;
  state.bestScore = Math.max(state.bestScore ?? 0, state.quizScore);
  COURSE.questions.forEach((question) => {
    XAPI.answered(
      question.id,
      question.prompt,
      state.quizAnswers[question.id],
      state.quizAnswers[question.id] === question.answer
    );
  });
  publish(false);
  render();
}

function finishCourse() {
  if (!state.quizSubmitted || state.sent || closed) return;
  const passed = state.bestScore >= PASS_COUNT;
  const raw = Math.round((state.bestScore / COURSE.questions.length) * 100);
  SCORM.set("cmi.core.score.min", "0");
  SCORM.set("cmi.core.score.max", "100");
  SCORM.set("cmi.core.score.raw", String(raw));
  SCORM.set("cmi.core.lesson_status", passed ? "passed" : "failed");
  SCORM.set("cmi.core.exit", "logout");
  SCORM.set("cmi.core.session_time", SCORM.sessionTime());
  state.sent = true;
  publish(true);
  XAPI.result(passed, raw, state.bestScore, COURSE.questions.length);
  closed = true;
  SCORM.finish();
  render();
}

document.getElementById("course").addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === "next") {
    if (canContinue()) goSlide(state.slide + 1);
  } else if (action === "prev") {
    goSlide(state.slide - 1);
  } else if (action === "jump") {
    goSlide(Number(button.dataset.index));
  } else if (action === "jump-module") {
    const mod = COURSE.modules.find((item) => item.id === button.dataset.module);
    goSlide(COURSE.slides.findIndex((slide) => slide.id === mod.slides[0]));
  } else if (action === "toggle-notes") {
    state.notes = !state.notes;
    render();
  } else if (action === "toggle-card") {
    const id = button.dataset.id;
    state.openedCards = state.openedCards.includes(id)
      ? state.openedCards.filter((card) => card !== id)
      : state.openedCards.concat(id);
    publish(false);
    render();
  } else if (action === "focus-clear") {
    state.clearFocus = button.dataset.id;
    render();
  } else if (action === "choose") {
    const node = COURSE.scenario.nodes[state.scenario.current];
    if (state.scenario.log.some((beat) => beat.nodeId === node.id)) return;
    const choice = node.choices.find((item) => item.id === button.dataset.id);
    state.scenario.log.push({ nodeId: node.id, choiceId: choice.id });
    if (choice.next) state.scenario.current = choice.next;
    XAPI.answered(node.id, node.prompt, choice.id, choice.tone === "strong");
    publish(false);
    render();
  } else if (action === "reset-scenario") {
    state.scenario = { current: "late", log: [] };
    publish(false);
    render();
  } else if (action === "submit-quiz") {
    submitQuiz();
  } else if (action === "retry-quiz") {
    state.quizSubmitted = false;
    state.quizAnswers = {};
    state.quizScore = null;
    state.quizError = false;
    publish(false);
    render();
  } else if (action === "finish") {
    finishCourse();
  }
});

document.getElementById("course").addEventListener("input", (event) => {
  if (event.target.id === "reflection") state.reflection = event.target.value;
});

document.getElementById("course").addEventListener("change", (event) => {
  const name = event.target.name || "";
  if (!name.startsWith("quiz-")) return;
  state.quizAnswers[name.replace("quiz-", "")] = event.target.value;
  state.quizError = false;
  publish(false);
});

document.getElementById("course").addEventListener("focusout", (event) => {
  if (event.target.id === "reflection") publish(false);
});

document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea")) return;
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
  event.preventDefault();
  if (event.key === "ArrowLeft") goSlide(state.slide - 1);
  else if (currentSlide().type === "quiz" && !state.quizSubmitted) submitQuiz();
  else if (currentSlide().type === "summary") finishCourse();
  else if (canContinue()) goSlide(state.slide + 1);
});

window.addEventListener("pagehide", () => {
  if (closed) return;
  SCORM.set("cmi.core.exit", "suspend");
  SCORM.set("cmi.core.session_time", SCORM.sessionTime());
  publish(true);
  SCORM.finish();
  closed = true;
});

SCORM.initialize();
restore();
if (!state.visited.includes(currentSlide().id)) state.visited.push(currentSlide().id);
XAPI.initialized();
XAPI.experienced(currentSlide());
publish(false);
render();
