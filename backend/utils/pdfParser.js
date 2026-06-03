const fs = require('fs');
const pdf = require('pdf-parse');

async function parsePDF(filePath) {
    try {
        let dataBuffer = fs.readFileSync(filePath);
        let data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw error;
    }
}

module.exports = {
    parsePDF
};
