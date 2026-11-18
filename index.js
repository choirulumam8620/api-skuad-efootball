const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));
app.use(express.json());

const skuad = {
  manajer: "Antonio Conte",
  formasi: "4-3-1-2",
  pemainKunci: ["Lionel Messi", "Luis Suárez", "Johan Cruyff"],
};

app.get("/skuad", (req, res) => {
  res.json(skuad);
});

app.post("/pemain", (req, res) => {
  const { nama } = req.body;
  if (!nama || nama.trim() === "") {
    return res.status(400).json({ pesan: "Nama pemain tidak boleh kosong" });
  }
  skuad.pemainKunci.push(nama.trim());
  res.status(201).json({ pesan: "Pemain berhasil ditambahkan", skuad });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
