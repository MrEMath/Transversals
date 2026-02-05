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

  const studentNames = [...new Set(teacherRecords.map(r => r.studentName))];
  const attemptIds = [...new Set(teacherRecords.map(r => r.attemptId))];
  const correctCount = teacherRecords.filter(r => r.correct).length;
  const percentCorrect = teacherRecords.length
    ? Math.round((correctCount / teacherRecords.length) * 100)
    : 0;

  overallStatsEl.innerHTML = `
    <p>Students: <strong>${studentNames.length}</strong></p>
    <p>Total practice attempts: <strong>${attemptIds.length}</strong></p>
    <p>Average accuracy (all items): <strong>${percentCorrect}%</strong></p>
  `;

  renderItemAnalysis(teacherRecords, itemAnalysisBody);
  populateStudentDropdown(studentNames, studentSelect);
  studentSummaryEl.innerHTML = "";
  studentItemBody.innerHTML = "";
}

function renderItemAnalysis(records, itemAnalysisBody) {
  itemAnalysisBody.innerHTML = "";

  const byQuestion = {};
  records.forEach(r => {
    if (!byQuestion[r.questionId]) byQuestion[r.questionId] = [];
    byQuestion[r.questionId].push(r);
  });

  Object.keys(byQuestion)
    .sort((a, b) => a - b)
    .forEach(qid => {
      const group = byQuestion[qid];
      const correct = group.filter(r => r.correct).length;
      const total = group.length;
      const percent = total ? Math.round((correct / total) * 100) : 0;
      const sbgLevel = group[0].sbg;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${qid}</td>
        <td>${sbgLevel}</td>
        <td>${percent}%</td>
      `;
      itemAnalysisBody.appendChild(tr);
    });
}

function populateStudentDropdown(studentNames, studentSelect) {
  studentSelect.innerHTML = '<option value="">Select a student</option>';
  studentNames.sort().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    studentSelect.appendChild(opt);
  });
}

// ---------- STUDENT DETAIL ----------

function renderStudentSummaryAndAttempts(studentName, studentSummaryEl, attemptSelect) {
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher && r.studentName === studentName
  );
  if (!records.length) {
    studentSummaryEl.textContent = "No data for this student.";
    return;
  }

  const byAttempt = {};
  records.forEach(r => {
    if (!byAttempt[r.attemptId]) byAttempt[r.attemptId] = [];
    byAttempt[r.attemptId].push(r);
  });

  const attemptIds = Object.keys(byAttempt).sort();
  const totalAttempts = attemptIds.length;

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

  attemptSelect.innerHTML = '<option value="">Select an attempt</option>';
  attemptIds.forEach(id => {
    const any = byAttempt[id][0];
    const date = new Date(any.timestamp);
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
    r.attemptId === Number(attemptId)
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
