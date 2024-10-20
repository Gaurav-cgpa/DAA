import express from "express";
// import { coordinates } from "../controller.js/coordinates.controller.js";
import { travel } from "../controller.js/travel.controller.js";


const router=express.Router();

// router.get('/coordinates',coordinates);
router.post('/travel',travel);

export default router;