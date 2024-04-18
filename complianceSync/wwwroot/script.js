const axios = require('axios');
const cheerio = require('cheerio');
const sql = require('mssql');

// Configuration for Azure SQL database
const config = {
    user: 'your_username',
    password: 'your_password',
    server: 'your_server',
    database: 'your_database',
    options: {
        encrypt: true // If using Azure, set to true
    }
};

// Function to scrape webpage for PDF documents
async function scrapeWebpage(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const pdfLinks = [];

        // Find all <a> tags with href ending in '.pdf'
        $('a[href$=".pdf"]').each((index, element) => {
            const pdfLink = $(element).attr('href');
            pdfLinks.push(pdfLink);
        });

        // Sort PDF links by date (if available)
        pdfLinks.sort((a, b) => {
            const dateA = new Date($(a).text());
            const dateB = new Date($(b).text());
            return dateA - dateB;
        });

        return pdfLinks;
    } catch (error) {
        console.error('Error scraping webpage:', error);
        return [];
    }
}

// Function to insert PDF links into Azure SQL database
async function insertIntoDatabase(pdfLinks) {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        for (const pdfLink of pdfLinks) {
            await request.query(`INSERT INTO Documents (Link) VALUES ('${pdfLink}')`);
        }

        console.log('PDF links inserted into database successfully.');
    } catch (error) {
        console.error('Error inserting into database:', error);
    } finally {
        sql.close();
    }
}

// Usage
const url = 'https://www.epa.gov/compliance'; // Replace with your desired URL
scrapeWebpage(url)
    .then(pdfLinks => insertIntoDatabase(pdfLinks))
    .catch(error => console.error('Error:', error));


//Button Functionality to be coded below --->





