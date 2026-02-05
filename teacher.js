const TEACHER_PASSWORDS = {
  Englade: "englade2026",
  Russell: "russell2026",
  Miller: "miller2026",
  Massengill: "massengill2026",
  Clark: "clark2026"
};

let currentTeacher = null;
let allRecords = [];

function loadData() {
  const raw = localStorage.getItem("reflectionPracticeResults");
  allRecords = raw ? JSON.parse(raw) : [];
}

document.addEventListener("DOMContentLoaded", () => {
  const teacherNameEl = document.getElementById("teacher-name");
  const teacherPasswordEl = document.getElementById("teacher-password");
  const teacherLoginBtn = document.getElementById("teacher-login-btn");
  const teacherLoginError = document.getElementById("teacher-login-error");

  const loginSection = document.getElementById("teacher-login");
  const dashboardSection = document.getElementById("teacher-dashboard");
  const overallStatsEl = document.getElementById("overall-stats");
  const itemAnalysisBody = document.querySelector("#item-analysis-table tbody");
  const studentSelect = document.getElementById("student-select");
  const studentSummaryEl = document.getElementById("student-summary");
  const studentItemBody = document.querySelector("#student-item-table tbody");
  const attemptSelect = document.getElementById("attempt-select");

  loadData();

  teacherLoginBtn.addEventListener("click", () => {
    const name = teacherNameEl.value;
    const pwd = teacherPasswordEl.value.trim();

    if (!name || !pwd) {
      teacherLoginError.textContent = "Select your name and enter password.";
      return;
    }

    if (TEACHER_PASSWORDS[name] !== pwd) {
      teacherLoginError.textContent = "Incorrect password.";
      return;
    }

    teacherLoginError.textContent = "";
    currentTeacher = name;

    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    document.getElementById("dashboard-title").textContent =
      `Teacher Dashboard – ${name}`;

    renderDashboard(
      overallStatsEl,
      itemAnalysisBody,
      studentSelect,
      studentSummaryEl,
      studentItemBody
    );
  });

  studentSelect.addEventListener("change", () => {
    const name = studentSelect.value;
    studentSummaryEl.innerHTML = "";
    studentItemBody.innerHTML = "";
    attemptSelect.innerHTML = '<option value="">Select an attempt</option>';

    if (!name) return;

    renderStudentSummaryAndAttempts(
      name,
      studentSummaryEl,
      attemptSelect
    );
  });

  attemptSelect.addEventListener("change", () => {
    const attemptId = attemptSelect.value;
    const studentName = attemptSelect._studentName;
    if (!attemptId || !studentName) {
      studentItemBody.innerHTML = "";
      return;
    }
    renderStudentAttemptItems(studentName, attemptId, studentItemBody);
  });
});

// ---------- DASHBOARD FUNCTIONS ----------

function renderDashboard(
  overallStatsEl,
  itemAnalysisBody,
  studentSelect,
  studentSummaryEl,
  studentItemBody
) {
  const teacherRecords = allRecords.filter(r => r.teacher === currentTeacher);

  const latestByStudentQuestion = buildLatestByStudentQuestion(teacherRecords);
  buildSbgQuestionCards(teacherRecords, latestByStudentQuestion);

  const studentName = [...new Set(teacherRecords.map(r => r.studentName))];
  const attemptIds = [...new Set(teacherRecords.map(r => r.attemptId))];
  const correctCount = teacherRecords.filter(r => r.correct).length;
  const percentCorrect = teacherRecords.length
    ? Math.round((correctCount / teacherRecords.length) * 100)
    : 0;

  // build per-student current SBG
  const byStudent = {};
  teacherRecords.forEach(r => {
    if (!byStudent[r.studentName]) byStudent[r.studentName] = [];
    byStudent[r.studentName].push(r);
  });

  const sbgCounts = {};  // { '0.5': 3, '1.0': 5, ... }
  Object.keys(byStudent).forEach(name => {
    const level = computeStudentCurrentSbg(byStudent[name]);
    const key = level.toString();
    if (!sbgCounts[key]) sbgCounts[key] = 0;
    sbgCounts[key]++;
  });

  // SBG summary bar
  const sbgSummaryEl = document.getElementById("sbg-summary");
  let sbgHtml = "";
  Object.keys(sbgCounts).sort((a, b) => Number(a) - Number(b)).forEach(key => {
    const count = sbgCounts[key];
    const totalStudents = Object.keys(byStudent).length || 1;
    const pct = Math.round((count / totalStudents) * 100);
    sbgHtml += `
      <div class="sbg-row">
        <span class="sbg-label">Level ${key}</span>
        <div class="sbg-bar">
          <div class="sbg-bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="sbg-percent">${pct}%</span>
      </div>
    `;
  });
  sbgSummaryEl.innerHTML = sbgHtml;

  // students by SBG
  const sbgStudents = {}; // { '0.5': [ {name, level}, ... ], ... }
  Object.keys(byStudent).forEach(name => {
    const level = computeStudentCurrentSbg(byStudent[name]);
    const key = level.toString();
    if (!sbgStudents[key]) sbgStudents[key] = [];
    sbgStudents[key].push({ name, level });
  });

  const bandsEl = document.getElementById("sbg-student-bands");
  let bandsHtml = "";
  Object.keys(sbgStudents)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(key => {
      const students = sbgStudents[key].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      bandsHtml += `
        <div class="sbg-band">
          <div class="sbg-band-header">
            <span>Level ${key}</span>
            <span>${students.length} students</span>
          </div>
          <div class="sbg-chip-row">
            ${students
              .map(
                s => `<span class="sbg-chip">${s.name} – ${s.level}</span>`
              )
              .join("")}
          </div>
        </div>
      `;
    });
  bandsEl.innerHTML = bandsHtml;

  overallStatsEl.innerHTML = `
    <p>Students: <strong>${studentName.length}</strong></p>
    <p>Total practice attempts: <strong>${attemptIds.length}</strong></p>
    <p>Average accuracy (all items): <strong>${percentCorrect}%</strong></p>
  `;

  renderItemAnalysis(teacherRecords, itemAnalysisBody);
  populateStudentDropdown(studentName, studentSelect);
  studentSummaryEl.innerHTML = "";
  studentItemBody.innerHTML = "";
}

function buildSbgQuestionCards(teacherRecords, latestByStudentQuestion) {
  const container = document.getElementById("sbg-question-cards");
  container.innerHTML = "";

  // group by sbg then questionId
  const sbgGroups = {}; // { '0.5': { '1': [records...], ... }, ... }

  teacherRecords.forEach(r => {
    const sbgKey = r.sbg.toString();
    const qid = r.questionId;

    if (!sbgGroups[sbgKey]) sbgGroups[sbgKey] = {};
    if (!sbgGroups[sbgKey][qid]) sbgGroups[sbgKey][qid] = [];
    sbgGroups[sbgKey][qid].push(r);
  });

  Object.keys(sbgGroups)
    .sort((a, b) => Number(a) - Number(b))
    .forEach(sbgKey => {
      const questions = sbgGroups[sbgKey];
      const card = document.createElement("div");
      card.className = "sbg-card";

      let inner = `<div class="sbg-card-header">Level ${sbgKey}</div>`;
      inner += `<div class="sbg-card-questions">`;

      Object.keys(questions)
        .sort((a, b) => Number(a) - Number(b))
        .forEach(qid => {
          const qRecords = questions[qid];

          // per-question % correct (class)
          const correct = qRecords.filter(r => r.correct).length;
          const total = qRecords.length;
          const pct = total ? Math.round((correct / total) * 100) : 0;

          // student list using latestByStudentQuestion
          const byStudent = {};
          qRecords.forEach(r => {
            const key = `${r.studentName}|${r.questionId}`;
            const latest = latestByStudentQuestion[key];
            if (!latest) return;
            if (!byStudent[latest.studentName]) {
              byStudent[latest.studentName] = latest;
            }
          });

          const students = Object.values(byStudent).sort((a, b) =>
            a.studentName.localeCompare(b.studentName)
          );

          inner += `
            <div class="sbg-question-tile">
              <div class="sbg-question-header">
                <span>Q${qid}</span>
                <span>${pct}% correct</span>
              </div>
              <div class="sbg-question-students">
                ${students
                  .map(
                    r =>
                      `<div class="sbg-question-student">${r.studentName} – ${
                        r.correct ? "✔" : "✘"
                      }</div>`
                  )
                  .join("")}
              </div>
            </div>
          `;
        });

      inner += `</div>`;
      card.innerHTML = inner;
      container.appendChild(card);
    });
}

const byQuestion = {};
records.forEach(r => {
  const qid = r.questionnumber;
  if (!byQuestion[qid]) byQuestion[qid] = [];
  byQuestion[qid].push(r);
});

Object.keys(byQuestion)
  .sort((a, b) => a - b)
  .forEach(qid => {
    const group = byQuestion[qid];
    const correct = group.filter(r => r.correct).length;
    const total = group.length;
    const percent = total ? Math.round((correct / total) * 100) : 0;
    const sbgLevel = group.sbglevel;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${qid}</td>
      <td>${sbgLevel}</td>
      <td>${percent}%</td>
    `;
    itemAnalysisBody.appendChild(tr);
  });

function populateStudentDropdown(studentName, studentSelect) {
  studentSelect.innerHTML = '<option value="">Select a student</option>';
  studentName.sort().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    studentSelect.appendChild(opt);
  });
}

function buildLatestByStudentQuestion(teacherRecords) {
  const latest = {}; // key: student|question -> record

  teacherRecords.forEach(r => {
    const key = `${r.studentName}|${r.questionId}`;
    if (!latest[key]) {
      latest[key] = r;
    } else if (r.attemptId > latest[key].attemptId) {
      latest[key] = r;
    }
  });
  return latest;
}

// ---------- STUDENT DETAIL ----------

function renderStudentSummaryAndAttempts(studentName, studentSummaryEl, attemptSelect) {
  // 1. Get this student's records for the current teacher
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher && r.studentName === studentName
  );
  if (!records.length) {
    studentSummaryEl.textContent = "No data for this student.";
    return;
  }

  // 2. Group by attempt using timestamp as the attempt id
  const byAttempt = {};
  records.forEach(r => {
    const attemptId = r.timestamp;  // use timestamp as the key
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });

  const attemptIds = Object.keys(byAttempt).sort(); // oldest → newest
  const totalAttempts = attemptIds.length;

  // 3. Compute current SBG from the latest attempt
  const latestId = attemptIds[attemptIds.length - 1];
  const latest = byAttempt[latestId];
  const correctItems = latest.filter(r => r.correct);
  const currentSbgLevel =
    correctItems.length
      ? (
          correctItems.reduce((sum, r) => sum + (r.sbg || 0), 0) /
          correctItems.length
        ).toFixed(2)
      : "0.0";

  studentSummaryEl.innerHTML = `
    <p>Student: <strong>${studentName}</strong></p>
    <p>Practice attempts: <strong>${totalAttempts}</strong></p>
    <p>Current SBG level: <strong>${currentSbgLevel}</strong></p>
  `;

  // 4. Build attempt dropdown (label from timestamp)
  attemptSelect.innerHTML = '<option value="">Select an attempt</option>';
  attemptIds.forEach(id => {
    const date = new Date(id);        // id is the timestamp string
    const label = date.toLocaleString();
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = label;
    attemptSelect.appendChild(opt);
  });

  attemptSelect._studentName = studentName;
}

function renderStudentAttemptItems(studentName, attemptId, studentItemBody) {
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher &&
    r.studentName === studentName &&
    r.timestamp === attemptId
  );

  studentItemBody.innerHTML = "";
  records
    .sort((a, b) => a.questionId - b.questionId)
    .forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.questionId}</td>
        <td>${r.sbg}</td>
        <td>${r.correct ? "✔" : "✘"}</td>
      `;
      studentItemBody.appendChild(tr);
    });
}

function computeStudentCurrentSbg(recordsForStudent) {
  // group by attempt using timestamp
  const byAttempt = {};
  recordsForStudent.forEach(r => {
    const attemptId = r.timestamp;  // same key you used in renderStudentSummaryAndAttempts
    if (!byAttempt[attemptId]) byAttempt[attemptId] = [];
    byAttempt[attemptId].push(r);
  });

  // take the latest attempt
  const attemptIds = Object.keys(byAttempt).sort();
  const latest = byAttempt[attemptIds[attemptIds.length - 1]];

  // average SBG over correct items in that attempt
  const correctItems = latest.filter(r => r.correct);
  if (!correctItems.length) return 0;

  const avgSbg =
    correctItems.reduce((sum, r) => sum + (r.sbg || 0), 0) /
    correctItems.length;

  return Number(avgSbg.toFixed(1)); // e.g. 0.5, 1.0, 1.5
}
