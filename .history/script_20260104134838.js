const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let allData = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('tableBody');
    const cardContainer = document.getElementById('cardContainer');

    // =============================
    // LOAD DATA
    // =============================
    async function loadData() {
        const res = await fetch(API_URL + "?action=list");
        const data = await res.json();
        allData = data;
        renderAll(data);
    }

    // =============================
    // RENDER TABLE + CARD
    // =============================
    function renderAll(data) {
        renderTable(data);
        renderCard(data);
    }

    // =============================
    // TABLE (DESKTOP)
    // =============================
    function renderTable(data) {
        tableBody.innerHTML = '';

        data.forEach((row, index) => {
            const statusText = row.lunas ? 'Lunas' : 'Belum';
            const statusBadge = row.lunas ? 'badge-lunas' : 'badge-belum';

            tableBody.innerHTML += `
        <tr>
          <td>${row.noLapak}</td>
          <td>${row.nama}</td>
          <td>${row.ukuran}</td>
          <td>${row.a1}</td>
          <td>${row.a2}</td>
          <td>${row.a3}</td>
          <td>${row.a4}</td>
          <td>Rp ${Number(row.total).toLocaleString('id-ID')}</td>
          <td>
            <input type="checkbox"
              ${row.qris ? 'checked' : ''}
              data-index="${index}">
          </td>
          <td>
            <span class="badge ${statusBadge}">${statusText}</span>
          </td>
        </tr>
      `;
        });
    }

    // =============================
    // CARD (MOBILE)
    // =============================
    function renderCard(data) {
        cardContainer.innerHTML = '';

        data.forEach((row, index) => {
            const statusText = row.lunas ? 'Lunas' : 'Belum';
            const statusBadge = row.lunas ? 'badge-lunas' : 'badge-belum';

            cardContainer.innerHTML += `
        <div class="pelapak-card">
          <div class="pelapak-header">
            <div>
              <div class="lapak">Lapak ${row.noLapak}</div>
              <div class="nama">${row.nama}</div>
            </div>
            <span class="badge ${statusBadge}">${statusText}</span>
          </div>

          <div class="pelapak-body">
            <div class="item">
              <span>Ukuran</span>
              <strong>${row.ukuran}</strong>
            </div>

            <div class="item">
              <span>QRIS</span>
              <input type="checkbox"
                ${row.qris ? 'checked' : ''}
                data-index="${index}">
            </div>

            <div class="item">
              <span>Total Bayar</span>
              <strong>Rp ${Number(row.total).toLocaleString('id-ID')}</strong>
            </div>

            <div class="item">
              <span>Status</span>
              <strong>${statusText}</strong>
            </div>
          </div>
        </div>
      `;
        });
    }

    // =============================
    // UPDATE QRIS (TABLE & CARD)
    // =============================
    document.body.addEventListener('change', async (e) => {
        if (e.target.type === 'checkbox' && e.target.dataset.index !== undefined) {
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

    // =============================
    // SEARCH (REALTIME)
    // =============================
    searchInput.addEventListener('keyup', () => {
        const keyword = searchInput.value.toLowerCase();

        const filtered = allData.filter(item =>
            item.noLapak.toString().toLowerCase().includes(keyword) ||
            item.nama.toLowerCase().includes(keyword)
        );

        renderAll(filtered);
    });

    loadData();
});
