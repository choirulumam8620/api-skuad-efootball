const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const FILE_AWAL = path.join(__dirname, "skuad.json");
const FILE_DATA = process.env.VERCEL
  ? path.join("/tmp", "skuad.json")
  : FILE_AWAL;

const dataAwal = {
  manajer: "Antonio Conte",
  formasi: "4-3-1-2",
  pemainKunci: ["Lionel Messi", "Luis Suárez", "Johan Cruyff"],
};

function bacaSkuad() {
  if (!fs.existsSync(FILE_DATA)) {
    let sumberData = dataAwal;
    if (FILE_DATA !== FILE_AWAL && fs.existsSync(FILE_AWAL)) {
      sumberData = JSON.parse(fs.readFileSync(FILE_AWAL, "utf-8"));
    }
    fs.writeFileSync(FILE_DATA, JSON.stringify(sumberData, null, 2));
    return sumberData;
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

app.put("/skuad", (req, res) => {
  const { manajer, formasi } = req.body;
  const skuad = bacaSkuad();
  if (manajer && manajer.trim() !== "") skuad.manajer = manajer.trim();
  if (formasi && formasi.trim() !== "") skuad.formasi = formasi.trim();
  simpanSkuad(skuad);
  res.json({ pesan: "Info skuad berhasil diperbarui", skuad });
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

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
