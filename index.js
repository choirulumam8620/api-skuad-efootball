const express = require("express");
const fs = require("fs");
const path = require("path");
const { Redis } = require("@upstash/redis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const FILE_DATA = path.join(__dirname, "skuad.json");
const KUNCI_REDIS = "skuad_efootball";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const dataAwal = {
  manajer: "Antonio Conte",
  formasi: "4-3-1-2",
  pemainKunci: ["Lionel Messi", "Luis Suárez", "Johan Cruyff"],
};

async function bacaSkuad() {
  if (redis) {
    const dataRedis = await redis.get(KUNCI_REDIS);
    if (!dataRedis) {
      let sumberData = dataAwal;
      if (fs.existsSync(FILE_DATA)) {
        sumberData = JSON.parse(fs.readFileSync(FILE_DATA, "utf-8"));
      }
      await redis.set(KUNCI_REDIS, sumberData);
      return sumberData;
    }
    return typeof dataRedis === "string" ? JSON.parse(dataRedis) : dataRedis;
  }

  if (!fs.existsSync(FILE_DATA)) {
    fs.writeFileSync(FILE_DATA, JSON.stringify(dataAwal, null, 2));
    return dataAwal;
  }
  return JSON.parse(fs.readFileSync(FILE_DATA, "utf-8"));
}

async function simpanSkuad(data) {
  if (redis) {
    await redis.set(KUNCI_REDIS, data);
    return;
  }
  fs.writeFileSync(FILE_DATA, JSON.stringify(data, null, 2));
}

app.get("/skuad", async (req, res) => {
  try {
    const skuad = await bacaSkuad();
    res.json(skuad);
  } catch (error) {
    res.status(500).json({ pesan: "Gagal membaca data skuad" });
  }
});

app.put("/skuad", async (req, res) => {
  try {
    const { manajer, formasi } = req.body;
    const skuad = await bacaSkuad();
    if (manajer && manajer.trim() !== "") skuad.manajer = manajer.trim();
    if (formasi && formasi.trim() !== "") skuad.formasi = formasi.trim();
    await simpanSkuad(skuad);
    res.json({ pesan: "Info skuad berhasil diperbarui", skuad });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal memperbarui info skuad" });
  }
});

app.post("/pemain", async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama || nama.trim() === "") {
      return res.status(400).json({ pesan: "Nama pemain tidak boleh kosong" });
    }
    const skuad = await bacaSkuad();
    skuad.pemainKunci.push(nama.trim());
    await simpanSkuad(skuad);
    res.status(201).json({ pesan: "Pemain berhasil disimpan", skuad });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal menyimpan pemain baru" });
  }
});

app.delete("/pemain/:nama", async (req, res) => {
  try {
    const namaHapus = req.params.nama;
    const skuad = await bacaSkuad();
    skuad.pemainKunci = skuad.pemainKunci.filter((nama) => nama !== namaHapus);
    await simpanSkuad(skuad);
    res.json({ pesan: "Pemain berhasil dihapus", skuad });
  } catch (error) {
    res.status(500).json({ pesan: "Gagal menghapus pemain" });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
