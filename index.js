import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai"; // Import from the URL

async function extractTextFromPDF(pdfFile) {
    const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(pdfFile));
    const pdf = await loadingTask.promise;

    let text = "";
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }

    return text;
}

const chooseFoodBtn = document.getElementById('chooseFoodBtn');
const foodRecommendationDiv = document.getElementById('foodRecommendation');
const pdfInput = document.getElementById('pdfInput');
const weightInput = document.getElementById('weightInput');
const heightInput = document.getElementById('heightInput');
const mealTypeSelect = document.getElementById('mealType');

chooseFoodBtn.addEventListener('click', async () => {
    const pdfFile = pdfInput.files[0];
    const weight = parseFloat(weightInput.value);
    const height = parseFloat(heightInput.value);
    const dietPreference = document.querySelector('input[name="diet"]:checked').value;
    const mealType = mealTypeSelect.value;

    if (!pdfFile) {
        alert('Please select a PDF file.');
        return;
    }

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        alert('Please enter valid weight and height.');
        return;
    }

    // try {
    //     const pdfText = await extractTextFromPDF(pdfFile);
    //     const prompt = `Based on this dietary information:\n\n${pdfText}\n\nand considering a weight of ${weight} kg, height of ${height} cm, and a ${dietPreference} diet,\nsuggest a healthy and delicious meal option:`;
    //     const foodRecommendation = await getFoodRecommendation(prompt);
    //     foodRecommendationDiv.textContent = foodRecommendation;
    // } 
    try {
        const pdfText = await extractTextFromPDF(pdfFile);
        const prompt = `Based on this dietary information:\n\n${pdfText}\n\nand considering a weight of ${weight} kg, height of ${height} cm, and a ${dietPreference} diet,\nsuggest a healthy and delicious meal option:`;
        const foodOptions = await getFoodRecommendation(prompt);

        // Format and display options
        const optionsList = document.createElement('ul');
        foodOptions.split('\n').forEach(option => {
            if (option.trim() !== '') { // Skip empty lines
                const listItem = document.createElement('li');
                listItem.textContent = option.trim();
                optionsList.appendChild(listItem);
            }
        });

        foodRecommendationDiv.textContent = ''; // Clear previous content
        foodRecommendationDiv.appendChild(optionsList);
    }
    catch (error) {
        console.error('Error:', error);
        foodRecommendationDiv.textContent = 'Error occurred. Please try again.';
    } 
});

// async function getFoodRecommendation(prompt) {
//     const API_KEY = 'AIzaSyBp9kdE682FNJ-v66CovAOgSB2-aKiNaGI'; // Replace with your actual API key
//     const genAI = new GoogleGenerativeAI(API_KEY);
//     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;

    
//     const text = await response.text();
//     return text;
   
// }

async function getFoodRecommendation(prompt) {
    const API_KEY = 'AIzaSyBp9kdE682FNJ-v66CovAOgSB2-aKiNaGI'; // Replace with your actual API key
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Ensure two options are generated
    prompt += "\n\nPlease provide TWO meal options in a formatted way.";
    const optionsResult = await model.generateContent(prompt);
    const optionsResponse = await optionsResult.response;
    const optionsText = await optionsResponse.text();
    return optionsText;
}
