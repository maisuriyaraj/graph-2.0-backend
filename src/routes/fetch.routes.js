import { Router } from "express";
import { fetchDataFromStackOverflow } from "../controller/questions.controller.js";

const fetchRoute = Router();


fetchRoute.route('/stackoverflow').get(fetchDataFromStackOverflow);

export {fetchRoute};

