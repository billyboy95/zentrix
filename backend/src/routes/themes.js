const { Router } = require("express");
const { listThemes } = require("../lib/themes");

const router = Router();

router.get("/", (_req, res) => {
  res.json({ themes: listThemes() });
});

module.exports = router;
