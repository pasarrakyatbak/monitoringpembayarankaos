const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";
let allData = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tbody = document.querySelector('tbody');

    async function loadData() {
        const res = await fetch(API_URL + "?action=list");
        const data = await res.json();
        allData = data;
        renderTable(data);
    }

    function renderTable(data) {
        tbody.innerHTML = '';
        data.forEach((row, index) => {
            const statusText = row.lunas ? 'Lunas' : 'Belum Lunas';
            const statusClass = row.lunas ? 'status-lunas' : 'status-belum';

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
          <input type="checkbox" ${row.qris ? 'checked' : ''} data-index="${index}">
        </td>
        <td class="${statusClass}">${statusText}</td>
      `;
            tbody.appendChild(tr);
        });
    }

    tbody.addEventListener('change', async (e) => {
        if (e.target.type === 'checkbox') {
            const index = e.target.dataset.index;

            const formData = new FormData();
            formData.append("action", "updateQRIS");
            formData.append("index", index);
            formData.append("qris", e.target.checked ? "true" : "false");

            await fetch(API_URL, {
                method: "POST",
                body: formData
            });

            loadData();
        }
    });

    searchInput.addEventListener('keyup', () => {
        const keyword = searchInput.value.toLowerCase();
        const filtered = allData.filter(item =>
            item.noLapak.toString().includes(keyword) ||
            item.nama.toLowerCase().includes(keyword)
        );
        renderTable(filtered);
    });

    loadData();
});
