import express from "express";

const router = express.Router();

// Define the /api/hello route
router.get("/api/hello", (req, res) => {
  res.status(200).json({ message: "Hello, world!" });
});

router.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Test" });
});

export default router;
