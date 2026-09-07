const { Router } = require("express");
const { listCatalog } = require("../lib/themes");

const router = Router();

router.get("/", (_req, res) => {
  const { themes, flow } = listCatalog();
  res.json({ themes, flow });
});

module.exports = router;
