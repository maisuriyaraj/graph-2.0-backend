import puppeteer from 'puppeteer';
import questionsModel from '../models/questions.model.js';

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
        console.error('Error occurred while fetching data: ', error);
        response.status(500).send({ error: 'Internal Server Error' });
    }
}
