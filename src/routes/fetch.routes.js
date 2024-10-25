import { Router } from "express";
import { fetchDataFromStackOverflow, getQuestions } from "../controller/questions.controller.js";

const fetchRoute = Router();


fetchRoute.route('/stackoverflow').get(fetchDataFromStackOverflow);

fetchRoute.route('/getQuestions').get(getQuestions);

export {fetchRoute};

