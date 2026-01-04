const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

  let masterData = [];

  document.addEventListener('DOMContentLoaded', refreshData);

  function refreshData() {
    const icon = document.getElementById('refresh-icon');
    const loader = document.getElementById('loader');
    
    icon.classList.add('fa-spin-fast');
    loader.style.display = 'block';

    google.script.run
      .withSuccessHandler(function(data) {
        masterData = data;
        renderData(data);
        icon.classList.remove('fa-spin-fast');
        loader.style.display = 'none';
      })
      .getKaosData();
  }

  function renderData(data) {
    const tbody = document.getElementById('tableBody');
    const mobileList = document.getElementById('mobileList');
    
    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    data.forEach(item => {
      // Logic Parsing Angsuran
      const a1 = parseFloat(item['Angsuran 1']) || 0;
      const a2 = parseFloat(item['Angsuran 2']) || 0;
      const a3 = parseFloat(item['Angsuran 3']) || 0;
      const a4 = parseFloat(item['Angsuran 4']) || 0;
      
      // Logic QRIS Checkbox (Dari Sheet kolom "QRIS")
      const isQris = String(item['QRIS']).toUpperCase() === 'TRUE' || item['QRIS'] === true;
      
      let sumAngsuran = a1 + a2 + a3 + a4;
      let totalAkhir = sumAngsuran;
      let statusLunas = item['Status'] === 'LUNAS';

      // ATURAN KHUSUS: Jika QRIS diklik
      if (isQris) {
        totalAkhir = Math.max(0, sumAngsuran - 25000);
        statusLunas = true; // Otomatis Lunas
      }

      const statusBadge = statusLunas 
        ? '<span class="badge status-lunas">LUNAS</span>' 
        : '<span class="badge status-proses">PROSES</span>';

      // 1. Render Desktop Row
      const row = `
        <tr>
          <td><span style="font-weight:700; color:var(--primary)">#${item['Nomor Lapak']}</span></td>
          <td><div style="font-weight:600">${item['Nama Pelapak']}</div></td>
          <td style="text-align:center">${item['Ukuran Kaos']}</td>
          <td><div style="font-size:0.8rem; color:var(--text-muted)">${a1}|${a2}|${a3}|${a4}</div></td>
          <td>${isQris ? '<span class="badge qris-badge"><i class="fas fa-qrcode"></i> QRIS</span>' : '<span style="color:#ccc">Tunai</span>'}</td>
          <td style="font-weight:800">Rp ${totalAkhir.toLocaleString('id-ID')}</td>
          <td style="text-align:center">${statusBadge}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);

      // 2. Render Mobile Card
      const card = `
        <div class="payment-card">
          <div class="card-top">
            <div>
              <div class="card-title">${item['Nama Pelapak']}</div>
              <div class="card-subtitle">Nomor Lapak: ${item['Nomor Lapak']}</div>
            </div>
            ${statusBadge}
          </div>
          <div class="card-grid">
            <div style="font-size:0.7rem; color:var(--text-muted)">UKURAN: <b style="color:var(--text-dark)">${item['Ukuran Kaos']}</b></div>
            <div style="font-size:0.7rem; color:var(--text-muted); text-align:right">METODE: <b>${isQris ? 'QRIS' : 'Tunai'}</b></div>
          </div>
          <div style="margin-top:15px; display:flex; justify-content:space-between; align-items:center">
            <span style="font-size:0.8rem; color:var(--text-muted)">Total Bayar:</span>
            <span style="font-size:1.1rem; font-weight:800; color:var(--primary)">Rp ${totalAkhir.toLocaleString('id-ID')}</span>
          </div>
        </div>
      `;
      mobileList.insertAdjacentHTML('beforeend', card);
    });
  }

  function filterData() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = masterData.filter(i => 
      String(i['Nama Pelapak']).toLowerCase().includes(query) || 
      String(i['Nomor Lapak']).toLowerCase().includes(query)
    );
    renderData(filtered);
  }