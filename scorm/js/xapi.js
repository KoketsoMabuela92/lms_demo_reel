const XAPI = (function xapiClient() {
  const verbs = {
    initialized: ["http://adlnet.gov/expapi/verbs/initialized", "initialized"],
    experienced: ["http://adlnet.gov/expapi/verbs/experienced", "experienced"],
    answered: ["http://adlnet.gov/expapi/verbs/answered", "answered"],
    completed: ["http://adlnet.gov/expapi/verbs/completed", "completed"],
    passed: ["http://adlnet.gov/expapi/verbs/passed", "passed"],
    failed: ["http://adlnet.gov/expapi/verbs/failed", "failed"],
  };
  const activityId = "https://example.com/sa1262/say-it-clearly";

  function actor() {
    const name = SCORM.get("cmi.core.student_name") || "Mabuela, Koketso";
    const account = SCORM.get("cmi.core.student_id") || "SA_1262";
    return {
      name: name,
      account: { homePage: "https://example.com/lms", name: account },
    };
  }

  function send(statement) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ source: "sa1262-sco", type: "xapi", statement: statement }, "*");
    }
  }

  function statement(verbKey, objectId, name, extra) {
    const verb = verbs[verbKey];
    const payload = {
      actor: actor(),
      verb: { id: verb[0], display: { "en-US": verb[1] } },
      object: {
        id: objectId,
        definition: {
          name: { "en-US": name },
          type: (extra && extra.type) || "http://adlnet.gov/expapi/activities/lesson",
        },
      },
      timestamp: new Date().toISOString(),
    };
    if (extra && extra.result) payload.result = extra.result;
    send(payload);
    return payload;
  }

  return {
    activityId: activityId,
    initialized() {
      statement("initialized", activityId, "Say It Clearly");
    },
    experienced(slide) {
      statement("experienced", activityId + "/slides/" + slide.id, slide.title, {
        type: "http://adlnet.gov/expapi/activities/module",
      });
    },
    answered(id, name, response, success) {
      statement("answered", activityId + "/interactions/" + id, name, {
        type: "http://adlnet.gov/expapi/activities/cmi.interaction",
        result: { response: response, success: success },
      });
    },
    result(passed, raw, best, total) {
      const result = {
        score: { scaled: Number((best / total).toFixed(2)), raw: raw, min: 0, max: 100 },
        success: passed,
        completion: true,
      };
      statement(passed ? "passed" : "failed", activityId, "Say It Clearly", { result: result });
      statement("completed", activityId, "Say It Clearly", { result: result });
    },
  };
})();
