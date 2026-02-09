// ---------------- API BASE URL (no longer used, safe to leave or remove) ----------------
const API_BASE_URL = "https://your-api.example.com"; // TODO: replace or ignore

// ----- ROSTERS -----
const roster = {
  Englade: [
    "Eduardo","Wilson","Tamara","Jakelin","Joy","Carmen","Genesis V","Laqoria",
    "Christopher","Mauricio","Karin","Juliesse","Javion","Claudia","Ezequiel",
    "Jesly","Hazel","Gloria","Susannah","Genri","Rossmery","Ronald","Bryan",
    "Keith","Myles","Ariana","Kaelynn","Blessen","Jacob","Jayana","Ashlynn",
    "Genesis A","Kason","Jayden","Andres","Julianna","Israel","Sergio",
    "Camila M","Sena","Eiyten","Brenda","Aneista","De'zariah","Leslie",
    "Terrell","Samuel","Jannat","Nilka","Denilson","Camila R","Kiya","Aiden",
    "Aliany","Tyler","Camaurie","Hailee","Teodora","Jeremiah","Evelynn",
    "Victor","Jashua","Malia","Venus","James","Alison"
  ],
  Russell: [
    "April L","Zain A","Sebastian A","Madul B","Evolet D","Derick M",
    "Anthony C","Asani D","Elena R","Zoe M","Nicolle M","Ashley G","Zachary H",
    "Krystal V","Jacob M","Ayesha K","Jordan M","Liliana O","Natalie R","Kingston R",
    "Lucia O","Joshelyne R","Allan E","Elijah W","Gersan D","Nya B","Gianny C","Danna C",
    "Ashten C","Valeria R","Kierstin D","Macie D","Natalia U","Kirellos G","Brenton G",
    "Brady L","Aziah L","Jacklyn M","Ridwan M","Sophia N","Tylan P","Sophia P",
    "Jose C","Kaeli R","Andy R","Annie R","Martell R","Alonzo W","Edom A","Zainin A",
    "Liam A","Aurora A","Kelianny A","Carlos M","Evelyn O","Maria F","London G",
    "Isabella G","Sofia V","Holy G","Fabian G","Gia H","Jennie L","Gustavo M","Charles M",
    "Samantha R","Dana E","Darryl S","Hanley T","Angelis G","Paiton W"
  ],
  Miller: [
    "Malia A","Rico B","Angel B","Malcolm B","Camden C","Spencer C","Jose O",
    "Brady D","Kirollos E","Emma F","Sumera G","Mya G","Bentley G","Anas H","Jayden H",
    "Alisson M","Paul H","Sara L","Gin M","Jaxson P","Sophia Ph","Suri T","Daniel R",
    "Ronny R","Edgar R","Tyler W","Bailie W","Paul W","Tomas Y","Fidelino L","Lucas M",
    "Jaymon B","Aiden B","Alex L","Alan R","Uziel S","Brianna S","Ellay G","Dawayne G",
    "Kiya H","Ka'Miyah J","Justice J","Rony R","Greyson M","Saba N","Lisa B","Andrea A",
    "Gerardo C","Ariel S","Maya V","Brandon E","Dawit W","Emily H","Aaliya C","Erynn C",
    "Jason D","Andrew D","Maria C","Allison J","Shenouda H","Landyn J","Candice J","KJ J",
    "Nessa L","Lily L","Ca'Myah M","Keiry M","Mauricio O","Devick M","David R","Makenzie R",
    "Keilyn S","Johani D","Jeremy P","Brendan C","Amiyah W","Violet L"
  ],
  Massengill: [],
  Clark: [
    "Angela A","Violet A","Youanna A","Karim O","Joel C","Zenobia D","Gianni F",
    "Karen P","Christian H","Estefany P","Aldo J","Miquel K","Seth L","Zion L","Ashley A",
    "Camiyah M","Merci N","Kylee N","Helen P","Juan J","Caleb P","Alva P","Elaria S","Aubrey A",
    "Karas A","Kayla B","Nicole C","Alexandria C","Bayron D","Naomy B","Khori G","Evelyn R",
    "Maritza G","Stacy G","Carah R","King S","Nicholas S","Breanna T","Edgar V","Kailee W",
    "Josiah W","Abdirahman A","Abdallah A","Kinley C","Starkiesha C","Sakinh D","Albenis C",
    "Manuel H","Derrick J","Aisha J","Kelaiden J","Tamoya K","Timothy K","Ryan M","Islaha M",
    "Lyliana M","Jonathan G","Briana M","Gianni R","Jeremiah R","Alexandra S","Savannah S","Justin S","Joseph W"
  ]
};

// ----- STUDENT ATTEMPT STORAGE -----
let allStudentData = [];
let isDataReady = false;

function loadLocalData() {
  const raw = localStorage.getItem("reflectionPracticeResults");
  allStudentData = raw ? JSON.parse(raw) : [];
  isDataReady = true;
}

function saveLocalAttempt(record) {
  const raw = localStorage.getItem("reflectionPracticeResults");
  const all = raw ? JSON.parse(raw) : [];
  all.push(record);
  localStorage.setItem("reflectionPracticeResults", JSON.stringify(all));
}

// ----- SUPABASE SAVE (added) -----
async function saveAttemptsToSupabase(records) {
  if (typeof supabase === "undefined") {
    // Supabase not configured; fail silently so practice still works
    return;
  }
  const { error } = await supabase
    .from("attempts")
    .insert(
      records.map((r) => ({
        teacher: r.teacher,
        student_name: r.studentName,
        question_id: r.questionId,
        sbg: r.sbg,
        answer: r.answer,
        attempts: r.attempts,
        correct: r.correct,
        timestamp: r.timestamp
      }))
    );
  if (error) {
    console.error("Error inserting attempts into Supabase", error);
  }
}

// ----- DATA -----
const questions = [
  { id: 1, sbg: 0.5, text: "Which statement best describes the relationship between ∠m and ∠n?", image: "practice-images/1.png", choices: [ "They are corresponding angles.", "They are vertical angles.", "They are supplementary angles.", "They are alternate interior angles." ], correct: "b", hint: "Think about where the angles are located relative to the transversal." },
  { id: 2, sbg: 0.5, text: "Which statement best describes the relationship between ∠m and ∠n?", image: "practice-images/2.png", choices: [ "They are corresponding angles.", "They are vertical angles.", "They are supplementary angles.", "They are alternate interior angles." ], correct: "d", hint: "Compare their positions inside the parallel lines." },
  { id: 3, sbg: 0.5, text: "Which statement best describes the relationship between ∠m and ∠n?", image: "practice-images/3.png", choices: [ "They are corresponding angles.", "They are vertical angles.", "They are supplementary angles.", "They are alternate interior angles." ], correct: "c", hint: "Compare their positions inside the parallel lines." },
  { id: 4, sbg: 0.5, text: "Which statement best describes the relationship between ∠m and ∠n?", image: "practice-images/3.png", choices: [ "They are same-side interior angles.", "They are vertical angles.", "They are corresponding angles.", "They are alternate interior angles." ], correct: "a", hint: "Compare their positions inside the parallel lines." },
  { id: 5, sbg: 0.5, text: "Which statement best describes the relationship between ∠m and ∠n?", image: "practice-images/4.png", choices: [ "They are same-side interior angles.", "They are vertical angles.", "They are corresponding angles.", "They are alternate interior angles." ], correct: "c", hint: "Compare their positions inside the parallel lines." },
  { id: 6, sbg: 1.0, text: "What is the measure of ∠d?", image: "practice-images/5.png", choices: [ "120°", "180°", "130°", "310°" ], correct: "c", hint: "Compare their positions inside the parallel lines." },
  { id: 7, sbg: 1.0, text: "What is the measure of ∠c?", image: "practice-images/5.png", choices: [ "50°", "45°", "130°", "150°" ], correct: "a", hint: "Compare their positions inside the parallel lines." },
  { id: 8, sbg: 1.0, text: "What is the measure of ∠h?", image: "practice-images/5.png", choices: [ "50°", "45°", "150°", "130°" ], correct: "d", hint: "Compare their positions inside the parallel lines." },
  {
    id: 9, sbg: 1.0,
    text: "For each statement, choose whether it is true or false.",
    image: "", type: "matrix",
    statements: [
      { id: "stmt1", text: "Vertical angles are congruent.", correct: "T" },
      { id: "stmt2", text: "Adjacent angles are congruent.", correct: "F" },
      { id: "stmt3", text: "Vertical angles are supplementary.", correct: "F" },
      { id: "stmt4", text: "Adjacent angles are supplementary.", correct: "T" }
    ],
    hint: "Think about the angle relationships shown in the diagram."
  },
  {
    id: 10, sbg: 1.0,
    text: "Jeremy said that adjacent angles are always supplementary because their measures add up to 180°. Which statement explains whether he is correct?",
    image: "",
    choices: [
      "Jeremy is incorrect, because adjacent angles are not always supplementary.",
      "Jeremy is incorrect because adjacent angles are always complementary.",
      "Jeremy is correct.",
      "Jeremy is incorrect because supplementary angles add up to 90°."
    ],
    correct: "a",
    hint: "Adjacent angles do always create a straight line."
  },
  {
    id: 11, sbg: 1.5,
    text: "Find the measure of each angle.",
    image: "practice-images/11.png",
    type: "fill",
    blanks: [
      { id: "A", label: "∠A =", correct: "135" },
      { id: "C", label: "∠C =", correct: "45" },
      { id: "D", label: "∠D =", correct: "135" }
    ],
    hint: "Use vertical, corresponding, and supplementary relationships."
  },
  {
    id: 12, sbg: 1.5,
    text: "Find the measure of each angle.",
    image: "practice-images/12.png",
    type: "fill",
    blanks: [
      { id: "x", label: "∠x =", correct: "110" },
      { id: "y", label: "∠y =", correct: "70" },
      { id: "z", label: "∠z =", correct: "110" }
    ],
    hint: "Use vertical, corresponding, and supplementary relationships."
  },
  {
    id: 13, sbg: 1.5,
    text: "Find the measure of each angle.",
    image: "practice-images/13.png",
    type: "fill",
    blanks: [
      { id: "a", label: "∠a =", correct: "130" },
      { id: "c", label: "∠c =", correct: "50" },
      { id: "d", label: "∠d =", correct: "130" },
      { id: "e", label: "∠e =", correct: "130" },
      { id: "f", label: "∠f =", correct: "50" },
      { id: "g", label: "∠g =", correct: "50" },
      { id: "h", label: "∠h =", correct: "130" }
    ],
    hint: "Use vertical, corresponding, and supplementary relationships."
  },
  {
    id: 14, sbg: 1.5,
    text: "Select all statements that are true about vertical angles.",
    image: "", type: "multi",
    options: [
      { id: "A", text: "Vertical angles are congruent.", correct: true },
      { id: "B", text: "Vertical angles share a common side.", correct: false },
      { id: "C", text: "Vertical angles are opposite each other.", correct: true },
      { id: "D", text: "Vertical angles are supplementary.", correct: false }
    ],
    hint: "Think about where vertical angles are and how they relate."
  },
  {
    id: 15, sbg: 1.5,
    text: "Select all statements that are true about alternate interior angles.",
    image: "", type: "multi",
    options: [
      { id: "A", text: "Alternate interior angles are supplementary", correct: false },
      { id: "B", text: "Alternate interior angles are congruent", correct: true },
      { id: "C", text: "Alternate interior angles are complementary", correct: false },
      { id: "D", text: "Alternate interior angles are not congruent.", correct: false },
      { id: "E", text: "Alternate interior angles are on opposite sides of the transversal.", correct: true }
    ],
    hint: "Think about where alternate interior angles are and how they relate."
  },
  { id: 16, sbg: 2.0, text: "Find the value of x.", image: "practice-images/16.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "20" }], hint: "Use vertical, corresponding, and supplementary relationships." },
  { id: 17, sbg: 2.0, text: "Find the value of x.", image: "practice-images/17.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "10" }], hint: "Use adjacent, corresponding, and supplementary relationships." },
  { id: 18, sbg: 2.0, text: "Find the value of x.", image: "practice-images/18.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "15" }], hint: "Use vertical, corresponding, and supplementary relationships." },
  { id: 19, sbg: 2.0, text: "Find the value of x.", image: "practice-images/19.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "50" }], hint: "Use adjacent, corresponding, and supplementary relationships." },
  { id: 20, sbg: 2.0, text: "Find the value of x.", image: "practice-images/20.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "15" }], hint: "Use vertical, corresponding, and supplementary relationships." },
  { id: 21, sbg: 2.5, text: "Find the value of x.", image: "practice-images/21.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "15" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 22, sbg: 2.5, text: "Find the value of x.", image: "practice-images/22.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "35" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 23, sbg: 2.5, text: "Find the value of x.", image: "practice-images/23.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "50" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 24, sbg: 2.5, text: "Find the value of x.", image: "practice-images/24.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "40" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 25, sbg: 2.5, text: "Find the value of x.", image: "practice-images/25.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "55" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 26, sbg: 3.0, text: "Find the value of x.", image: "practice-images/26.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "100" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 27, sbg: 3.0, text: "Find the value of x.", image: "practice-images/27.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "10" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 28, sbg: 3.0, text: "Find the value of x.", image: "practice-images/28.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "4" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 29, sbg: 3.0, text: "Find the value of x.", image: "practice-images/29.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "9" }], hint: "Use alternate interior, corresponding, and supplementary relationships." },
  { id: 30, sbg: 3.0, text: "Find the value of x.", image: "practice-images/30.png", type: "fill", blanks: [{ id: "x", label: "x =", correct: "-9" }], hint: "Use alternate interior, corresponding, and supplementary relationships." }
];

// stores student answers by index
const studentAnswers = new Array(questions.length).fill(null);
const questionStates = questions.map(() => ({
  answered: false,
  correct: null,
  attempts: 0
}));
let currentIndex = 0; // 0-based

// ----- ELEMENTS -----
const progressBar = document.getElementById("progress-bar");
const itemNavigator = document.getElementById("item-navigator");
const problemNumber = document.getElementById("problem-number");
const problemText = document.getElementById("problem-text");
const problemImage = document.getElementById("problem-image");
const choicesList = document.getElementById("choices-list");
const feedback = document.getElementById("feedback");
const checkBtn = document.getElementById("check-answer");
const hintBtn = document.getElementById("hint");
const skipBtn = document.getElementById("skip");
const nextBtn = document.getElementById("next-question");
const loginScreen = document.getElementById("login-screen");
const practiceScreen = document.getElementById("practice-screen");
const teacherSelectEl = document.getElementById("teacher-select");
const studentSelectEl = document.getElementById("student-select");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");
const submitPracticeBtn = document.getElementById("submit-practice");
const summaryScreen = document.getElementById("summary-screen");

// LOGIN BUTTON
loginButton.addEventListener("click", () => {
  const teacher = teacherSelectEl.value;
  const student = studentSelectEl.value;
  if (!teacher || !student) {
    loginError.textContent = "Please select your teacher and your name.";
    return;
  }
  loginError.textContent = "";
  const currentStudent = { teacher, student };
  localStorage.setItem("reflectionCurrentStudent", JSON.stringify(currentStudent));
  loginScreen.style.display = "none";
  practiceScreen.style.display = "block";
  initNavigator();
  renderQuestion();
  updateProgress();
});

function populateTeachers() {
  teacherSelectEl.innerHTML = "";
  Object.keys(roster).forEach(teacherName => {
    const opt = document.createElement("option");
    opt.value = teacherName;
    opt.textContent = teacherName;
    teacherSelectEl.appendChild(opt);
  });
}

function populateStudentsForTeacher(teacher) {
  studentSelectEl.innerHTML = "";
  if (!teacher) {
    studentSelectEl.disabled = true;
    return;
  }
  const students = roster[teacher] || [];
  students.forEach(studentName => {
    const opt = document.createElement("option");
    opt.value = studentName;
    opt.textContent = studentName;
    studentSelectEl.appendChild(opt);
  });
  studentSelectEl.disabled = false;
}

teacherSelectEl.addEventListener("change", () => {
  const teacher = teacherSelectEl.value;
  populateStudentsForTeacher(teacher);
});

function restoreLoginIfPresent() {
  const raw = localStorage.getItem("reflectionCurrentStudent");
  if (!raw) return;
  try {
    const currentStudent = JSON.parse(raw);
    if (!currentStudent.teacher || !currentStudent.student) return;
    teacherSelectEl.value = currentStudent.teacher;
    populateStudentsForTeacher(currentStudent.teacher);
    studentSelectEl.value = currentStudent.student;
  } catch (e) {
    console.error("Error parsing stored student", e);
  }
}

// ----- SETUP -----
function initNavigator() {
  itemNavigator.innerHTML = "";
  questions.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.textContent = index + 1;
    btn.classList.add("item-button");
    btn.dataset.index = index;
    btn.addEventListener("click", () => {
      saveCurrentAnswer();
      currentIndex = index;
      renderQuestion();
    });
    itemNavigator.appendChild(btn);
  });
}

function renderQuestion() {
  const q = questions[currentIndex];
  problemNumber.textContent = (currentIndex + 1) + ".";
  problemText.textContent = q.text;

  if (q.image) {
    problemImage.style.display = "block";
    problemImage.src = q.image;
    problemImage.alt = "Transversal problem " + (currentIndex + 1);
  } else {
    problemImage.style.display = "none";
  }

  choicesList.innerHTML = "";

  const stored = studentAnswers[currentIndex];

  if (q.type === "matrix") {
    const table = document.createElement("table");
    table.classList.add("tf-matrix");

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Statement</th>
        <th>True</th>
        <th>False</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const storedObj = stored || {};

    q.statements.forEach(stmt => {
      const tr = document.createElement("tr");

      const tdText = document.createElement("td");
      tdText.textContent = stmt.text;

      const tdTrue = document.createElement("td");
      const trueInput = document.createElement("input");
      trueInput.type = "radio";
      trueInput.name = stmt.id;
      trueInput.value = "T";
      if (storedObj[stmt.id] === "T") trueInput.checked = true;
      tdTrue.appendChild(trueInput);

      const tdFalse = document.createElement("td");
      const falseInput = document.createElement("input");
      falseInput.type = "radio";
      falseInput.name = stmt.id;
      falseInput.value = "F";
      if (storedObj[stmt.id] === "F") falseInput.checked = true;
      tdFalse.appendChild(falseInput);

      tr.appendChild(tdText);
      tr.appendChild(tdTrue);
      tr.appendChild(tdFalse);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    choicesList.appendChild(table);

  } else if (q.type === "fill") {
    const storedObj = stored || {};
    q.blanks.forEach(blank => {
      const li = document.createElement("li");

      const label = document.createElement("label");
      label.textContent = blank.label + " ";
      label.setAttribute("for", `blank-${blank.id}`);

      const input = document.createElement("input");
      input.type = "text";
      input.id = `blank-${blank.id}`;
      input.name = blank.id;
      input.size = 4;
      if (storedObj[blank.id] != null) {
        input.value = storedObj[blank.id];
      }

      li.appendChild(label);
      li.appendChild(input);
      choicesList.appendChild(li);
    });

  } else if (q.type === "multi") {
    const storedObj = stored || {};
    q.options.forEach(opt => {
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `multi-${q.id}-${opt.id}`;
      input.name = `multi-${q.id}`;
      input.value = opt.id;
      if (storedObj[opt.id]) {
        input.checked = true;
      }
      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = opt.text;
      li.appendChild(input);
      li.appendChild(label);
      choicesList.appendChild(li);
    });

  } else {
    const labels = ["a", "b", "c", "d"];
    q.choices.forEach((choiceText, i) => {
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "problem";
      input.id = `problem${q.id}-${labels[i]}`;
      input.value = labels[i];
      if (stored === labels[i]) {
        input.checked = true;
      }
      const label = document.createElement("label");
      label.setAttribute("for", input.id);
      label.textContent = choiceText;
      li.appendChild(input);
      li.appendChild(label);
      choicesList.appendChild(li);
    });
  }

  feedback.textContent = "";
  feedback.className = "";
  updateProgress();
  highlightNavigator();
  updateButtons();
}

// ANSWER HANDLING
function getSelectedAnswer() {
  const q = questions[currentIndex];

  if (q.type === "matrix") {
    const result = {};
    q.statements.forEach(stmt => {
      const selected = document.querySelector(`input[name="${stmt.id}"]:checked`);
      result[stmt.id] = selected ? selected.value : null;
    });
    return result;
  } else if (q.type === "fill") {
    const result = {};
    q.blanks.forEach(blank => {
      const input = document.getElementById(`blank-${blank.id}`);
      result[blank.id] = input ? input.value.trim() : "";
    });
    return result;
  } else if (q.type === "multi") {
    const result = {};
    q.options.forEach(opt => {
      const input = document.getElementById(`multi-${q.id}-${opt.id}`);
      result[opt.id] = input ? input.checked : false;
    });
    return result;
  } else {
    const radios = document.querySelectorAll('input[name="problem"]');
    for (const r of radios) {
      if (r.checked) return r.value;
    }
    return null;
  }
}

function saveCurrentAnswer() {
  const q = questions[currentIndex];
  const ans = getSelectedAnswer();

  if (q.type === "fill") {
    const values = Object.values(ans);
    const anyFilled = values.some(v => v && v.trim() !== "");
    if (!anyFilled) return;
  } else if (q.type === "matrix") {
    const values = Object.values(ans);
    const anyChosen = values.some(v => v === "T" || v === "F");
    if (!anyChosen) return;
  } else if (q.type === "multi") {
    const anyChecked = Object.values(ans).some(v => v);
    if (!anyChecked) return;
  } else if (!ans) {
    return;
  }

  studentAnswers[currentIndex] = ans;
}

function updateProgress() {
  const answered = studentAnswers.filter(ans => ans !== null).length;
  const total = questions.length;
  const percent = (answered / total) * 100;
  const progressTextEl = document.getElementById("progress-text");
  if (progressTextEl) {
    progressTextEl.textContent = `${answered}/${total} Complete`;
  }
  progressBar.style.width = `${percent}%`;
}

function highlightNavigator() {
  const buttons = document.querySelectorAll(".item-button");
  buttons.forEach((btn, index) => {
    btn.classList.toggle("current", index === currentIndex);
    btn.classList.toggle("answered", studentAnswers[index] !== null);
  });
}

function updateButtons() {
  nextBtn.disabled = currentIndex === questions.length - 1;
}

// FINISH PRACTICE (local + Supabase)
function finishPractice() {
  const rawStudent = localStorage.getItem("reflectionCurrentStudent");
  const currentStudent = rawStudent ? JSON.parse(rawStudent) : null;
  if (!currentStudent) return;

  const records = questions.map((q, index) => ({
    teacher: currentStudent.teacher,
    studentName: currentStudent.student,
    questionId: q.id,
    sbg: q.sbg,
    answer: studentAnswers[index],
    attempts: questionStates[index].attempts,
    correct: questionStates[index].correct,
    timestamp: new Date().toISOString()
  }));

  // keep existing local behavior
  records.forEach(saveLocalAttempt);

  // new: also send to Supabase (if configured)
  saveAttemptsToSupabase(records);
}

// HOOK UP SUBMIT BUTTON TO finishPractice
if (submitPracticeBtn) {
  submitPracticeBtn.addEventListener("click", () => {
    finishPractice();
    // your existing summary-screen logic can follow here if you had it
  });
}

// INITIALIZE
document.addEventListener("DOMContentLoaded", () => {
  loadLocalData();
  populateTeachers();
  restoreLoginIfPresent();
});
