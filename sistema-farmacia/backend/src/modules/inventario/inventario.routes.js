const express = require("express");

const router = express.Router();

const InventarioController = require("./inventario.controller");

router.get("/", InventarioController.getAll);

router.get("/:id", InventarioController.getById);

router.post("/", InventarioController.create);

router.put("/:id", InventarioController.update);

router.delete("/:id", InventarioController.remove);

module.exports = router;