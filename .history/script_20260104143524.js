const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let allData = [];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const tableBody = document.getElementById('tableBody');
    const cardContainer = document.getElementById('cardContainer');

    const loadingOverlay = document.getElementById('loadingOverlay');

    // =============================
    // LOADING HELPER
    // =============================
    function showLoading() {
        loadingOverlay.classList.remove('hidden');
    }

    function hideLoading() {
        loadingOverlay.classList.add('hidden');
    }

    // =============================
    // LOAD DATA
    // =============================
    async function loadData() {
        try {
            showLoading();

            const res = await fetch(API_URL + "?action=list");
            const data = await res.json();

            allData = data;
            renderAll(data);
            renderSummary(data);

        } catch (err) {
            console.error(err);
            alert("Gagal memuat data");
        } finally {
            hideLoading();
        }
    }

    // =============================
    // SUMMARY
    // =============================
    function renderSummary(data) {
        const totalPelapak = data.length;
        const totalLunas = data.filter(d => d.lunas).length;
        const totalBelum = totalPelapak - totalLunas;

        document.getElementById('totalPelapak').textContent = totalPelapak;
        document.getElementById('totalLunas').textContent = totalLunas;
        document.getElementById('totalBelum').textContent = totalBelum;
    }

    // =============================
    // RENDER ALL
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
            const statusText = row.lunas ? 'Lunas' : 'Belum Lunas';
            const statusBadge = row.lunas ? 'badge-lunas' : 'badge-belum';
            const rowClass = row.lunas ? '' : 'belum-lunas';

            tableBody.innerHTML += `
        <tr class="${rowClass}">
          <td>${row.noLapak}</td>
          <td>${row.nama}</td>
          <td>${row.ukuran}</td>
          <td>${row.a1}</td>
          <td>${row.a2}</td>
          <td>${row.a3}</td>
          <td>${row.a4}</td>
          <td>Rp ${Number(row.total).toLocaleString('id-ID')}</td>
          <td>
            <input type="checkbox" ${row.qris ? 'checked' : ''} data-index="${index}">
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
            const statusText = row.lunas ? 'Lunas' : 'Belum Lunas';
            const statusBadge = row.lunas ? 'badge-lunas' : 'badge-belum';
            const cardClass = row.lunas ? '' : 'belum-lunas';

            cardContainer.innerHTML += `
        <div class="pelapak-card ${cardClass}">
          <div class="pelapak-header">
            <div>
              <div class="lapak">Lapak ${row.noLapak}</div>
              <div class="N">${row.nama}</div>
            </div>
            <span class="badge ${statusBadge}">${statusText}</span>
          </div>

          <div class="pelapak-body">
            <div class="item"><span>Ukuran Kaos</span><strong>${row.ukuran}</strong></div>
            <div class="item"><span>Angsuran 1</span><strong>${row.a1}</strong></div>
            <div class="item"><span>Angsuran 2</span><strong>${row.a2}</strong></div>
            <div class="item"><span>Angsuran 3</span><strong>${row.a3}</strong></div>
            <div class="item"><span>Angsuran 4</span><strong>${row.a4}</strong></div>
            <div class="item"><span>Sisa Tagihan</span><strong>Rp ${Number(row.total).toLocaleString('id-ID')}</strong></div>
            <div class="item full">
              <span>QRIS</span>
              <input type="checkbox" ${row.qris ? 'checked' : ''} data-index="${index}">
            </div>
          </div>
        </div>
      `;
        });
    }


    // =============================
    // UPDATE QRIS (WITH LOADING)
    // =============================
    document.body.addEventListener('change', async (e) => {
        if (e.target.type === 'checkbox' && e.target.dataset.index !== undefined) {
            const index = e.target.dataset.index;

            try {
                showLoading();

                const formData = new FormData();
                formData.append("action", "updateQRIS");
                formData.append("index", index);
                formData.append("qris", e.target.checked ? "true" : "false");

                await fetch(API_URL, {
                    method: "POST",
                    body: formData
                });

                await loadData();
            } catch (err) {
                console.error(err);
                alert("Gagal update data");
            } finally {
                hideLoading();
            }
        }
    });

    // =============================
    // SEARCH
    // =============================
    searchInput.addEventListener('keyup', () => {
        const keyword = searchInput.value.toLowerCase();

        const filtered = allData.filter(item =>
            item.noLapak.toString().includes(keyword) ||
            item.nama.toLowerCase().includes(keyword)
        );

        renderAll(filtered);
        renderSummary(filtered);
    });

    // INIT
    loadData();
});
