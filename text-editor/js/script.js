document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const toolbar = document.getElementById('toolbar');

    console.log('Editor script loaded');

    // Helper function to insert text at the current cursor position
    function insertTextAtCursor(text) {
        editor.focus();
        document.execCommand('insertText', false, text);
    }

    // Helper function to insert HTML at the current cursor position
    function insertHTMLAtCursor(html) {
        editor.focus();
        document.execCommand('insertHTML', false, html);
    }

    // Function to handle voice transcription
    function handleVoiceTranscribe() {
        console.log('Botón Transcribir Voz clickeado');
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('El reconocimiento de voz no es compatible con este navegador.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.addEventListener('result', (event) => {
            const transcript = event.results[0][0].transcript;
            insertTextAtCursor(transcript + ' ');
        });

        recognition.addEventListener('error', (event) => {
            console.error('Error en el reconocimiento de voz:', event.error);
            alert('Ocurrió un error en el reconocimiento de voz: ' + event.error);
        });

        recognition.addEventListener('start', () => {
            console.log('Reconocimiento de voz iniciado...');
            // Podríamos cambiar el texto del botón o añadir un indicador visual
        });

        recognition.addEventListener('end', () => {
            console.log('Reconocimiento de voz finalizado.');
            // Podríamos restaurar el texto del botón o quitar el indicador visual
        });

        recognition.start();
    }

    // Function to call the serverless function for Gemini API
    async function callGeminiApi(promptText) {
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ promptText })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error en la respuesta de la función serverless:', data.error);
                throw new Error(data.error || 'Error desconocido al llamar a la API de Gemini.');
            }

            return data.text;

        } catch (error) {
            console.error('Error al llamar a la función serverless:', error);
            alert('Ocurrió un error al interactuar con la API de Gemini.');
            throw error; // Re-throw the error to be caught by the calling function
        }
    }

    // Function to handle spell and grammar check
    async function handleSpellCheck() {
        console.log('Botón Corrección Ortográfica y Gramatical clickeado');
        const textToCorrect = editor.innerText;
        const promptText = `Revisa y corrige la ortografía y gramática del siguiente texto en español. Proporciona solo el texto corregido:\n\n${textToCorrect}`;

        try {
            const correctedText = await callGeminiApi(promptText);
            const confirmReplace = confirm('Texto corregido:\n\n' + correctedText + '\n\n¿Deseas reemplazar el texto actual con la versión corregida?');
            if (confirmReplace) {
                editor.innerText = correctedText;
            }
        } catch (error) {
            // Error handled in callGeminiApi
        }
    }

    // Function to handle inserting a relevant sentence
    async function handleInsertSentence() {
        console.log('Botón Insertar Oración clickeado');
        const currentText = editor.innerText;
        const promptText = `Basándote en el siguiente texto, genera una oración relevante para continuar:\n\n${currentText}`;

        try {
            const generatedSentence = await callGeminiApi(promptText);
            insertTextAtCursor(generatedSentence.trim() + ' ');
        } catch (error) {
            // Error handled in callGeminiApi
        }
    }

    // Function to handle inserting a relevant paragraph
    async function handleInsertParagraph() {
        console.log('Botón Insertar Párrafo clickeado');
        const currentText = editor.innerText;
        const promptText = `Basándote en el siguiente texto, genera un párrafo relevante para continuar:\n\n${currentText}`;

        try {
            const generatedParagraph = await callGeminiApi(promptText);
            insertHTMLAtCursor(`<p>${generatedParagraph.trim()}</p>`);
        } catch (error) {
            // Error handled in callGeminiApi
        }
    }

    // Function to handle inserting a quote
    async function handleInsertQuote() {
        console.log('Botón Insertar Cita Textual clickeado');
        const currentText = editor.innerText;
        const promptText = `Basándote en el siguiente texto, sugiere una cita textual relevante. Proporciona solo el texto de la cita:\n\n${currentText}`;

        try {
            const suggestedQuote = await callGeminiApi(promptText);
            const quoteText = prompt('Cita sugerida:\n\n' + suggestedQuote + '\n\nPuedes editarla si lo deseas. Ingresa el texto final de la cita:');
            const quoteReference = prompt('Ingrese la referencia bibliográfica para la cita:');

            if (quoteText) {
                const blockquoteHTML = `<blockquote>"${quoteText}"<br><cite>${quoteReference || 'Sin referencia'}</cite></blockquote>`;
                insertHTMLAtCursor(blockquoteHTML);
            }
        } catch (error) {
            // Error handled in callGeminiApi
        }
    }

    // Function to handle DOCX export
    function handleExportDocx() {
        console.log('Botón Exportar a DOCX clickeado');
        alert('La exportación directa a .docx desde el navegador no es posible debido a limitaciones de seguridad y la complejidad del formato. Para esta funcionalidad, se requeriría una solución del lado del servidor o el uso de un servicio de terceros para convertir el contenido del editor a formato .docx.');
        // Aquí podrías añadir lógica para enviar el contenido a un endpoint de servidor si existiera
    }

    // Add event listeners to buttons
    document.getElementById('voice-transcribe').addEventListener('click', handleVoiceTranscribe);
    document.getElementById('spell-check').addEventListener('click', handleSpellCheck);
    document.getElementById('insert-line').addEventListener('click', handleInsertSentence); // Renamed from insert-line to reflect functionality
    document.getElementById('insert-paragraph').addEventListener('click', handleInsertParagraph);
    document.getElementById('insert-quote').addEventListener('click', handleInsertQuote);
    document.getElementById('export-docx').addEventListener('click', handleExportDocx);
});