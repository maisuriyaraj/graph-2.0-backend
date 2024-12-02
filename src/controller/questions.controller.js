import puppeteer from 'puppeteer';
import {questionsModel} from '../models/questions.model.js';
import APIResponse from '../utils/apiResponse.js';

/**
 * Fetch Questions List from StackOverflowd
 * @param {*} request 
 * @param {*} response 
 */
export async function fetchDataFromStackOverflow(request, response) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Go to the target URL
        await page.goto('https://stackoverflow.com/questions');
        
        // Get Specific Div Content
        const divContent = await page.evaluate(() => {
            // Get elements by class name
            const questions = document.getElementsByClassName('s-post-summary');
            if (questions.length) {
                // Convert NodeList to Array and map to extract outerHTML
                return Array.from(questions).map(question => {
                    let title = question.querySelector('.s-post-summary--content-title')?.innerText || 'No Title';
                    let description = question.querySelector('.s-post-summary--content-excerpt')?.innerText || 'No Descripton';
                    let link = question.querySelector('.s-link')?.href || '#';

                    return {title , description,link}
                });
            }
            return null;
        });

        const result = await questionsModel.insertMany(divContent);
    
        await browser.close();

        // Send the data as a response
        response.send({ data: result });

    } catch (error) {
        console.error('Error occurred while fetching data from stackoverflow: ', error);
        response.status(500).send({ error: 'Internal Server Error' });
    }
}

export async function getQuestions(request,response){
    try {
        const page = request?.query?.page || 1;
        const limit = request?.query?.limit || 10;
        const resultData = await questionsModel.find({}).skip(page * limit).limit(limit).exec();
        const count = await questionsModel.countDocuments({});

        const data = {
            mainData : resultData,
            count : count
        }

        response.status(201).json(new APIResponse(201,data,"Questions Fetched Successfully !"));
    } catch (error) {
        console.log("Error While fetching Questions :",error);
        response.status(500).send({ error: 'Internal Server Error' });

    }
}
