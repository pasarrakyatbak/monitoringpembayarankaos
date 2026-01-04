const dataPelapak = [
    {
        lapak: "A01",
        nama: "Bu Siti",
        ukuran: "L",
        a1: 20000,
        a2: 20000,
        a3: 0,
        a4: 0,
        sisa: 45000,
        qris: true,
        status: "Belum"
    },
    {
        lapak: "A02",
        nama: "Pak Budi",
        ukuran: "XL",
        a1: 30000,
        a2: 30000,
        a3: 25000,
        a4: 0,
        sisa: 0,
        qris: false,
        status: "Lunas"
    }
];

const tableBody = document.getElementById("tableBody");
const cardContainer = document.getElementById("cardContainer");
const searchInput = document.getElementById("searchInput");

function render(data) {
    tableBody.innerHTML = "";
    cardContainer.innerHTML = "";

    data.forEach(d => {
        // TABLE
        tableBody.innerHTML += `
      <tr>
        <td>${d.lapak}</td>
        <td>${d.nama}</td>
        <td>${d.ukuran}</td>
        <td>${d.a1}</td>
        <td>${d.a2}</td>
        <td>${d.a3}</td>
        <td>${d.a4}</td>
        <td>Rp ${d.sisa}</td>
        <td><span class="badge ${d.qris ? 'badge-yes' : 'badge-no'}">${d.qris ? 'Punya' : 'Tidak'}</span></td>
        <td><span class="badge ${d.status === 'Lunas' ? 'badge-lunas' : 'badge-belum'}">${d.status}</span></td>
      </tr>
    `;

        // CARD
        cardContainer.innerHTML += `
      <div class="pelapak-card">
        <div class="pelapak-header">
          <div>
            <div class="lapak">Lapak ${d.lapak}</div>
            <div class="nama">${d.nama}</div>
          </div>
          <span class="badge ${d.status === 'Lunas' ? 'badge-lunas' : 'badge-belum'}">${d.status}</span>
        </div>

        <div class="pelapak-body">
          <div class="item"><span>Ukuran</span>${d.ukuran}</div>
          <div class="item"><span>QRIS</span>${d.qris ? 'Punya' : 'Tidak'}</div>
          <div class="item"><span>Total Bayar</span>${d.a1 + d.a2 + d.a3 + d.a4}</div>
          <div class="item"><span>Sisa</span>Rp ${d.sisa}</div>
        </div>
      </div>
    `;
    });
}

searchInput.addEventListener("input", e => {
    const keyword = e.target.value.toLowerCase();
    const filtered = dataPelapak.filter(d =>
        d.nama.toLowerCase().includes(keyword) ||
        d.lapak.toLowerCase().includes(keyword)
    );
    render(filtered);
});

render(dataPelapak);
