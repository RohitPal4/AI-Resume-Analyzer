const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { verifyToken } = require('./auth');
const db = require('../database');
const { parsePDF } = require('../utils/pdfParser');
const { extractResumeData, evaluateResume } = require('../utils/gemini');

// Setup multer for file upload
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// Upload and Process Resume
router.post('/upload', verifyToken, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }

        // 1. Parse text based on extension
        const ext = path.extname(req.file.originalname).toLowerCase();
        let parsedText = '';
        if (ext === '.pdf') {
            parsedText = await parsePDF(req.file.path);
        } else {
            // For now, only PDF is fully supported or raw text fallback.
            // If DOCX support is strictly needed, we can integrate mammoth here.
            return res.status(400).json({ error: 'Only PDF is currently supported' });
        }

        // 2. Extract Structured Data using AI
        const structuredData = await extractResumeData(parsedText);
        if (structuredData && structuredData._error === 'RATE_LIMIT_EXCEEDED') {
            return res.status(429).json({ error: 'Google Gemini API free tier daily/minute quota exceeded. Please wait or upgrade your API key.' });
        }
        if (!structuredData) {
            return res.status(500).json({ error: 'Failed to extract data from resume using AI.' });
        }

        // 3. Evaluate Match Score and Feedback using AI
        const evaluation = await evaluateResume(structuredData, jobDescription);
        if (evaluation && evaluation._error === 'RATE_LIMIT_EXCEEDED') {
            return res.status(429).json({ error: 'Google Gemini API free tier daily/minute quota exceeded. Please wait or upgrade your API key.' });
        }

        // 4. Save to Database
        db.run(`INSERT INTO resumes (userId, filename, originalName, parsedText, extractedData, matchScore, feedback, jobDescription) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [
                    req.userId, 
                    req.file.filename, 
                    req.file.originalname, 
                    parsedText, 
                    JSON.stringify(structuredData), 
                    evaluation.matchScore, 
                    evaluation.feedback, 
                    jobDescription
                ], 
                function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to save to database' });
            }
            res.json({
                id: this.lastID,
                originalName: req.file.originalname,
                extractedData: structuredData,
                matchScore: evaluation.matchScore,
                feedback: evaluation.feedback
            });
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during processing' });
    }
});

// Get all processed resumes for the user
router.get('/list', verifyToken, (req, res) => {
    db.all(`SELECT id, originalName, extractedData, matchScore, feedback FROM resumes WHERE userId = ? ORDER BY matchScore DESC`, [req.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        // Parse the extractedData JSON string back to object
        const results = rows.map(row => ({
            ...row,
            extractedData: JSON.parse(row.extractedData)
        }));

        res.json(results);
    });
});

module.exports = router;
