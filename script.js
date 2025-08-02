// script.js

// --- 1. DOM Caching & Data Awal ---
const namaProdukInput = document.getElementById('namaProduk');
const namaKomponenInput = document.getElementById('namaKomponen');
const hargaKomponenInput = document.getElementById('hargaKomponen');
const btnTambahKomponen = document.getElementById('btnTambahKomponen');
const daftarKomponenUL = document.getElementById('daftarKomponen');

const nilaiProfitPersenInput = document.getElementById('nilaiProfitPersen');
const nilaiProfitNominalInput = document.getElementById('nilaiProfitNominal');
const profitRadios = document.querySelectorAll('input[name="tipeProfit"]');

const totalHPPSpan = document.getElementById('totalHPP');
const hargaJualSpan = document.getElementById('hargaJual');
const totalPotonganMarketplaceSpan = document.getElementById('totalPotonganMarketplace');
const keuntunganBersihSpan = document.getElementById('keuntunganBersih'); // Diperbarui

const btnReset = document.getElementById('btnReset');
const btnSimpanHistori = document.getElementById('btnSimpanHistori');
const daftarHistoriUL = document.getElementById('daftarHistori');
const btnExportHistoriExcel = document.getElementById('btnExportHistoriExcel');
const btnHapusSemuaHistori = document.getElementById('btnHapusSemuaHistori');
const btnToggleMarketplaceFee = document.getElementById('btnToggleMarketplaceFee');
const marketplaceFeeSection = document.getElementById('marketplaceFeeSection');
const marketplaceFeeInput = document.getElementById('marketplaceFee');

let komponen = JSON.parse(localStorage.getItem('komponen')) || [];
let histori = JSON.parse(localStorage.getItem('histori')) || [];

// --- 2. Fungsi Utama Aplikasi ---

function renderKomponen() {
  daftarKomponenUL.innerHTML = '';
  
  const htmlItems = komponen.map((item, index) => {
    if (item.editing) {
      return `
        <li class="list-group-item">
          <div class="row g-2 align-items-center">
            <div class="col-5">
              <input type="text" class="form-control" value="${item.nama}" id="editNama${index}">
            </div>
            <div class="col-4">
              <input type="number" class="form-control" value="${item.harga}" id="editHarga${index}">
            </div>
            <div class="col-3 d-flex gap-1">
              <button class="btn btn-success btn-sm w-50" onclick="simpanEdit(${index})" aria-label="Simpan">
                <i class="bi bi-check"></i>
              </button>
              <button class="btn btn-secondary btn-sm w-50" onclick="batalEdit(${index})" aria-label="Batal">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </li>
      `;
    } else {
      return `
        <li class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${item.nama}</strong><br>
              <small>Rp ${item.harga.toLocaleString('id-ID')}</small>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-warning btn-sm" onclick="editKomponen(${index})" aria-label="Edit">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="hapusKomponen(${index})" aria-label="Hapus">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </li>
      `;
    }
  }).join('');
  
  daftarKomponenUL.innerHTML = htmlItems;

  hitungHPP();
  simpanKeLocalStorage('komponen', komponen);
}

function tambahKomponen() {
  const nama = namaKomponenInput.value.trim();
  const harga = parseFloat(hargaKomponenInput.value);

  if (!nama || isNaN(harga) || harga <= 0) {
    alert('Isi nama dan harga komponen dengan benar!');
    return;
  }
  
  if (komponen.some(k => k.nama.toLowerCase() === nama.toLowerCase())) {
    alert('Komponen dengan nama ini sudah ada.');
    return;
  }

  komponen.push({ nama, harga });
  namaKomponenInput.value = '';
  hargaKomponenInput.value = '';
  namaKomponenInput.focus();
  renderKomponen();
}

function hapusKomponen(index) {
  if (confirm('Hapus komponen ini?')) {
    komponen.splice(index, 1);
    renderKomponen();
  }
}

function editKomponen(index) {
  komponen.forEach(item => item.editing = false);
  komponen[index].editing = true;
  renderKomponen();
}

function batalEdit(index) {
  komponen[index].editing = false;
  renderKomponen();
}

function simpanEdit(index) {
  const namaBaru = document.getElementById(`editNama${index}`).value.trim();
  const hargaBaru = parseFloat(document.getElementById(`editHarga${index}`).value);

  if (!namaBaru || isNaN(hargaBaru) || hargaBaru <= 0) {
    alert("Nama dan harga harus diisi dengan benar.");
    return;
  }

  komponen[index].nama = namaBaru;
  komponen[index].harga = hargaBaru;
  komponen[index].editing = false;
  renderKomponen();
}

function hitungHPP() {
  const total = komponen.reduce((acc, curr) => acc + curr.harga, 0);
  const mode = document.querySelector('input[name="tipeProfit"]:checked').value;
  const fee = parseFloat(marketplaceFeeInput.value) || 0;

  let nilaiProfit;
  if (mode === 'persen') {
    nilaiProfit = parseFloat(nilaiProfitPersenInput.value) || 0;
  } else {
    nilaiProfit = parseFloat(nilaiProfitNominalInput.value) || 0;
  }

  let hargaJual = mode === 'persen' ? total + (total * nilaiProfit / 100) : total + nilaiProfit;

  const potongan = hargaJual * (fee / 100);
  let hargaJualBersih = hargaJual - potongan;
  let keuntunganBersih = hargaJualBersih - total; // Kalkulasi Keuntungan Bersih

  totalHPPSpan.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  hargaJualSpan.textContent = `Rp ${hargaJual.toLocaleString('id-ID')}`;
  totalPotonganMarketplaceSpan.textContent = `Rp ${potongan.toLocaleString('id-ID')}`;
  keuntunganBersihSpan.textContent = `Rp ${keuntunganBersih.toLocaleString('id-ID')}`; // Diperbarui
}

function resetForm() {
  if (confirm('Reset semua data?')) {
    komponen = [];
    namaProdukInput.value = '';
    nilaiProfitPersenInput.value = '';
    nilaiProfitNominalInput.value = '';
    marketplaceFeeInput.value = '';
    renderKomponen();
  }
}

function toggleMarketplaceFee() {
    marketplaceFeeSection.classList.toggle('d-none');
    if (marketplaceFeeSection.classList.contains('d-none')) {
        marketplaceFeeInput.value = '';
        hitungHPP();
    }
}

function toggleProfitInput() {
  const mode = document.querySelector('input[name="tipeProfit"]:checked').value;
  if (mode === 'persen') {
    nilaiProfitPersenInput.disabled = false;
    nilaiProfitNominalInput.disabled = true;
    nilaiProfitNominalInput.value = '';
  } else {
    nilaiProfitPersenInput.disabled = true;
    nilaiProfitPersenInput.value = '';
    nilaiProfitNominalInput.disabled = false;
  }
  hitungHPP();
}

// --- 3. Fungsi Histori ---

function renderHistori() {
  daftarHistoriUL.innerHTML = '';
  if (histori.length === 0) {
    daftarHistoriUL.innerHTML = '<li class="list-group-item text-center text-muted">Belum ada histori kalkulasi.</li>';
    return;
  }

  const htmlHistori = histori.map((h, index) => {
    return `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <small class="text-muted">#${index + 1}</small>
          <strong>${h.namaProduk}</strong><br>
          <small>HPP: Rp ${h.totalHPP.toLocaleString('id-ID')}</small>
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-info text-white" onclick="lihatHistori(${index})">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="hapusHistori(${index})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </li>
    `;
  }).join('');
  daftarHistoriUL.innerHTML = htmlHistori;
}

function simpanHistori() {
  const namaProduk = namaProdukInput.value.trim();
  if (!namaProduk) {
    alert('Nama produk harus diisi untuk menyimpan histori!');
    namaProdukInput.focus();
    return;
  }

  if (komponen.length === 0) {
    alert('Tambahkan komponen terlebih dahulu!');
    return;
  }
  
  const total = komponen.reduce((acc, curr) => acc + curr.harga, 0);
  const hargaJual = parseFloat(hargaJualSpan.textContent.replace(/[Rp.\s]/g, ''));
  const totalPotonganMarketplace = parseFloat(totalPotonganMarketplaceSpan.textContent.replace(/[Rp.\s]/g, ''));
  const keuntunganBersih = parseFloat(keuntunganBersihSpan.textContent.replace(/[Rp.\s]/g, '')); // Diperbarui

  const kalkulasiBaru = {
    tanggal: new Date().toISOString(),
    namaProduk: namaProduk,
    komponen: [...komponen],
    totalHPP: total,
    hargaJual: hargaJual,
    potonganMarketplace: parseFloat(marketplaceFeeInput.value) || 0,
    totalPotonganMarketplace: totalPotonganMarketplace,
    keuntunganBersih: keuntunganBersih, // Diperbarui
    profitPersen: parseFloat(nilaiProfitPersenInput.value) || 0,
    profitNominal: parseFloat(nilaiProfitNominalInput.value) || 0
  };

  histori.push(kalkulasiBaru);
  simpanKeLocalStorage('histori', histori);
  renderHistori();
  alert(`Kalkulasi "${namaProduk}" berhasil disimpan!`);
}

function lihatHistori(index) {
  const dataHistori = histori[index];
  if (!dataHistori) return;

  if (confirm(`Apakah Anda ingin memuat ulang histori "${dataHistori.namaProduk}"? Data saat ini akan terhapus.`)) {
    komponen = [...dataHistori.komponen];
    namaProdukInput.value = dataHistori.namaProduk;
    marketplaceFeeInput.value = dataHistori.potonganMarketplace || '';
    nilaiProfitPersenInput.value = dataHistori.profitPersen || '';
    nilaiProfitNominalInput.value = dataHistori.profitNominal || '';
    
    if (dataHistori.potonganMarketplace > 0) {
        marketplaceFeeSection.classList.remove('d-none');
    } else {
        marketplaceFeeSection.classList.add('d-none');
    }
    
    if (dataHistori.profitPersen > 0) {
        document.getElementById('profitPersen').checked = true;
    } else {
        document.getElementById('profitNominal').checked = true;
    }
    toggleProfitInput();

    renderKomponen();
    alert(`Histori "${dataHistori.namaProduk}" berhasil dimuat.`);
  }
}

function hapusHistori(index) {
  if (confirm('Hapus histori ini?')) {
    histori.splice(index, 1);
    simpanKeLocalStorage('histori', histori);
    renderHistori();
    alert('Histori berhasil dihapus!');
  }
}

function hapusSemuaHistori() {
  if (confirm('Apakah Anda yakin ingin menghapus SEMUA histori kalkulasi?')) {
    histori = [];
    simpanKeLocalStorage('histori', histori);
    renderHistori();
    alert('Semua histori berhasil dihapus.');
  }
}

function simpanKeLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- 4. Fungsi Ekspor Histori ---

function exportHistoriExcel() {
  if (histori.length === 0) {
    alert('Tidak ada histori untuk diekspor!');
    return;
  }

  const wb = XLSX.utils.book_new();

  const summaryData = [['Nama Produk', 'Total HPP', 'Harga Jual', 'Potongan Marketplace (%)', 'Total Potongan', 'Keuntungan Bersih']]; // Diperbarui
  histori.forEach(h => {
    summaryData.push([
      h.namaProduk,
      h.totalHPP,
      h.hargaJual,
      h.potonganMarketplace,
      h.totalPotonganMarketplace,
      h.keuntunganBersih // Diperbarui
    ]);
  });
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Histori');

  histori.forEach((h, index) => {
    const sheetName = (h.namaProduk || `Produk ${index + 1}`).substring(0, 31);
    const detailData = [
      ['Nama Produk:', h.namaProduk],
      ['Total HPP:', h.totalHPP],
      ['Harga Jual:', h.hargaJual],
      ['Potongan Marketplace (%):', h.potonganMarketplace],
      ['Total Potongan Marketplace:', h.totalPotonganMarketplace],
      ['Keuntungan Bersih:', h.keuntunganBersih], // Diperbarui
      [],
      ['Komponen'],
      ['Nama', 'Harga'],
      ...h.komponen.map(c => [c.nama, c.harga])
    ];
    const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, wsDetail, sheetName);
  });

  XLSX.writeFile(wb, 'histori_hpp_kalkulasi.xlsx');
  alert('Histori berhasil diekspor!');
}

// --- 5. Inisialisasi Aplikasi ---

function initApp() {
  renderKomponen();
  renderHistori();
  toggleProfitInput();

  btnTambahKomponen.addEventListener('click', tambahKomponen);
  btnReset.addEventListener('click', resetForm);
  btnSimpanHistori.addEventListener('click', simpanHistori);
  btnExportHistoriExcel.addEventListener('click', exportHistoriExcel);
  btnHapusSemuaHistori.addEventListener('click', hapusSemuaHistori);
  btnToggleMarketplaceFee.addEventListener('click', toggleMarketplaceFee);
  
  nilaiProfitPersenInput.addEventListener('input', hitungHPP);
  nilaiProfitNominalInput.addEventListener('input', hitungHPP);
  marketplaceFeeInput.addEventListener('input', hitungHPP);
  profitRadios.forEach(radio => radio.addEventListener('change', toggleProfitInput));

  namaKomponenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') tambahKomponen();
  });
  hargaKomponenInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') tambahKomponen();
  });
}

document.addEventListener('DOMContentLoaded', initApp);