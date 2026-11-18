const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/skuad", (req, res) => {
  res.json({
    manajer: "Antonio Conte",
    formasi: "4-3-1-2",
    pemainKunci: ["Lionel Messi", "Luis Suárez", "Johan Cruyff"],
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
