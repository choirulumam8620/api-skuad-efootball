const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const FILE_DATA = path.join(__dirname, "skuad.json");

const dataAwal = {
  manajer: "Antonio Conte",
  formasi: "4-3-1-2",
  pemainKunci: ["Lionel Messi", "Luis Suárez", "Johan Cruyff"],
};

function bacaSkuad() {
  if (!fs.existsSync(FILE_DATA)) {
    fs.writeFileSync(FILE_DATA, JSON.stringify(dataAwal, null, 2));
    return dataAwal;
  }
  const isi = fs.readFileSync(FILE_DATA, "utf-8");
  return JSON.parse(isi);
}

function simpanSkuad(data) {
  fs.writeFileSync(FILE_DATA, JSON.stringify(data, null, 2));
}

app.get("/skuad", (req, res) => {
  const skuad = bacaSkuad();
  res.json(skuad);
});

app.post("/pemain", (req, res) => {
  const { nama } = req.body;
  if (!nama || nama.trim() === "") {
    return res.status(400).json({ pesan: "Nama pemain tidak boleh kosong" });
  }
  const skuad = bacaSkuad();
  skuad.pemainKunci.push(nama.trim());
  simpanSkuad(skuad);
  res.status(201).json({ pesan: "Pemain berhasil disimpan", skuad });
});

app.delete("/pemain/:nama", (req, res) => {
  const namaHapus = req.params.nama;
  const skuad = bacaSkuad();
  skuad.pemainKunci = skuad.pemainKunci.filter((nama) => nama !== namaHapus);
  simpanSkuad(skuad);
  res.json({ pesan: "Pemain berhasil dihapus", skuad });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
