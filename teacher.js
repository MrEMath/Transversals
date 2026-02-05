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
    if (!name) {
      studentSummaryEl.innerHTML = "";
      studentItemBody.innerHTML = "";
      return;
    }
    renderStudentDetail(name, studentSummaryEl, studentItemBody);
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
  const totalAttempts = teacherRecords.reduce((sum, r) => sum + (r.attempts || 1), 0);
  const correctCount = teacherRecords.filter(r => r.correct).length;
  const percentCorrect = teacherRecords.length
    ? Math.round((correctCount / teacherRecords.length) * 100)
    : 0;

  overallStatsEl.innerHTML = `
    <p>Students: <strong>${studentNames.length}</strong></p>
    <p>Total attempts: <strong>${totalAttempts}</strong></p>
    <p>Overall % correct: <strong>${percentCorrect}%</strong></p>
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
      const percent = group.length ? Math.round((correct / group.length) * 100) : 0;
      const attemptsAvg =
        group.reduce((sum, r) => sum + (r.attempts || 1), 0) / group.length;
      const sbgLevel = group[0].sbg;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${qid}</td>
        <td>${sbgLevel}</td>
        <td>${percent}%</td>
        <td>${attemptsAvg.toFixed(1)}</td>
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

function renderStudentDetail(studentName, studentSummaryEl, studentItemBody) {
  const records = allRecords.filter(r =>
    r.teacher === currentTeacher && r.studentName === studentName
  );

  if (!records.length) {
    studentSummaryEl.textContent = "No data for this student.";
    studentItemBody.innerHTML = "";
    return;
  }

  const attemptsTotal = records.reduce((sum, r) => sum + (r.attempts || 1), 0);
  const correct = records.filter(r => r.correct).length;
  const percentCorrect = Math.round((correct / records.length) * 100);

  studentSummaryEl.innerHTML = `
    <p>Student: <strong>${studentName}</strong></p>
    <p>Items attempted: <strong>${records.length}</strong></p>
    <p>Total attempts: <strong>${attemptsTotal}</strong></p>
    <p>% correct: <strong>${percentCorrect}%</strong></p>
  `;

  studentItemBody.innerHTML = "";
  records
    .sort((a, b) => a.questionId - b.questionId)
    .forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.questionId}</td>
        <td>${r.sbg}</td>
        <td>${r.attempts || 1}</td>
        <td>${r.correct ? "✔" : "✘"}</td>
      `;
      studentItemBody.appendChild(tr);
    });
}
