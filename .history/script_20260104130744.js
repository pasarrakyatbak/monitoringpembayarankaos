
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #e8f5e9, #f1f8e9);
}

.app {
  padding: 24px;
}

.header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #1b5e20;
}

.header p {
  margin-top: 4px;
  color: #4caf50;
}

.card {
  margin-top: 20px;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow-x: auto;
}

.toolbar {
  margin-bottom: 12px;
}

.toolbar input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  font-size: 14px;
}

.toolbar input:focus {
  outline: none;
  border-color: #2e7d32;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #2e7d32;
  color: white;
  padding: 12px;
  font-weight: 500;
  white-space: nowrap;
}

td {
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

tr:hover {
  background: #f9f9f9;
}

input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #2e7d32;
  cursor: pointer;
}

.status-lunas {
  color: #2e7d32;
  font-weight: 600;
}

.status-belum {
  color: #f57c00;
}

@media (max-width: 768px) {
  th, td {
    font-size: 12px;
    padding: 8px;
  }
}


=============================
FILE: script.js
=============================
const API_URL = "PASTE_URL_GAS_DISINI";
let allData = [];

const searchInput = document.getElementById('searchInput');
const tbody = document.querySelector('tbody');

async function loadData() {
  const res = await fetch(API_URL);
  const data = await res.json();
  allData = data;
  renderTable(data);
}

function renderTable(data) {
  tbody.innerHTML = '';

  data.forEach((row, index) => {
    const statusText = row.qris ? 'Lunas' : 'Belum';
    const statusClass = row.qris ? 'status-lunas' : 'status-belum';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.noLapak}</td>
      <td>${row.nama}</td>
      <td>${row.ukuran}</td>
      <td>${row.a1}</td>
      <td>${row.a2}</td>
      <td>${row.a3}</td>
      <td>${row.a4}</td>
      <td>Rp ${row.total.toLocaleString('id-ID')}</td>
      <td>
        <input type="checkbox" ${row.qris ? 'checked' : ''}
          onchange="updateQRIS(${index}, this.checked)" />
      </td>
      <td class="${statusClass}">${statusText}</td>
    `;
    tbody.appendChild(tr);
  });
}

searchInput.addEventListener('keyup', () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = allData.filter(item =>
    item.noLapak.toString().includes(keyword) ||
    item.nama.toLowerCase().includes(keyword)
  );
  renderTable(filtered);
});

async function updateQRIS(index, value) {
  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ index, qris: value })
  });
  loadData();
}

loadData();


=============================
BACKEND (Google Apps Script)
=============================
/*
function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Data');
  const rows = sheet.getDataRange().getValues();
  rows.shift();

  const data = rows.map(r => {
    const total = r[3] + r[4] + r[5] + r[6] - (r[8] ? 25000 : 0);
    return {
      noLapak: r[0],
      nama: r[1],
      ukuran: r[2],
      a1: r[3],
      a2: r[4],
      a3: r[5],
      a4: r[6],
      total: total,
      qris: r[8]
    };
  });

  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActive().getSheetByName('Data');
  sheet.getRange(data.index + 2, 9).setValue(data.qris);
  return ContentService.createTextOutput('OK');
}
*/
