const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function extractResumeData(text) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set, using mock extraction.");
        return {
            Name: "Mock Name",
            Email: "mock@email.com",
            Skills: ["Mock Skill 1", "Mock Skill 2"],
            Experience: "Mock Experience",
            Education: "Mock Education"
        };
    }
    try {
        const prompt = `
        You are a helpful AI that extracts structured information from a resume. 
        Please extract the following information from the provided resume text and return it as a valid JSON object:
        - "Name": The full name of the candidate.
        - "Email": The email address.
        - "Skills": An array of strings representing the skills.
        - "Experience": A short summary of their work experience.
        - "Education": A short summary of their education.

        Resume Text:
        ${text}

        Return ONLY a raw JSON object (without markdown blocks like \`\`\`json).
        `;
        
        let response;
        const maxRetries = 5;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                break;
            } catch (e) {
                const isRetryable = (e.status === 429 || e.status === 503);
                if (isRetryable && attempt < maxRetries) {
                    const delay = Math.min(3000 * Math.pow(2, attempt - 1), 30000);
                    console.warn(`API returned ${e.status}, retrying in ${delay/1000}s... (attempt ${attempt}/${maxRetries})`);
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    throw e;
                }
            }
        }

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error extracting resume data:', error.message || error);
        if (error.status === 429) {
            return { _error: 'RATE_LIMIT_EXCEEDED' };
        }
        return null;
    }
}

async function evaluateResume(resumeData, jobDescriptionText) {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set, using mock evaluation.");
        return {
            matchScore: Math.floor(Math.random() * 100),
            feedback: "Mock feedback: Add more relevant skills based on the job description."
        };
    }
    try {
        const prompt = `
        You are an expert technical recruiter and AI Resume Analyzer.
        Evaluate the following candidate's resume data against the provided Job Description.

        Candidate Data:
        ${JSON.stringify(resumeData, null, 2)}

        Job Description:
        ${jobDescriptionText}

        Perform a section-wise analysis (Skills, Experience, Education) and compute an overall match score out of 100.
        Also, provide specific feedback, highlighting strengths and improvement suggestions for the candidate to better match the job description.

        Return ONLY a valid JSON object with the following structure (without markdown blocks like \`\`\`json):
        {
            "matchScore": <number between 0 and 100>,
            "feedback": "<string: detailed strengths and improvement suggestions>"
        }
        `;
        
        let response;
        const maxRetries = 5;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                break;
            } catch (e) {
                const isRetryable = (e.status === 429 || e.status === 503);
                if (isRetryable && attempt < maxRetries) {
                    const delay = Math.min(3000 * Math.pow(2, attempt - 1), 30000);
                    console.warn(`API returned ${e.status}, retrying in ${delay/1000}s... (attempt ${attempt}/${maxRetries})`);
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    throw e;
                }
            }
        }

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.substring(3, jsonStr.length - 3).trim();
        }
        
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Error evaluating resume:', error.message || error);
        if (error.status === 429) {
            return { _error: 'RATE_LIMIT_EXCEEDED' };
        }
        return { matchScore: 0, feedback: "Error evaluating resume." };
    }
}

module.exports = {
    extractResumeData,
    evaluateResume
};
