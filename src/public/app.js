document.addEventListener('DOMContentLoaded', () => {
    const queryInput = document.getElementById('query-input');
    const searchButton = document.getElementById('search-button');
    const loadingElement = document.getElementById('loading');
    const resultsElement = document.getElementById('results');
    const answerElement = document.getElementById('answer');
    const sourcesListElement = document.getElementById('sources-list');
    const errorElement = document.getElementById('error');

    // Function to show loading state
    function showLoading() {
        loadingElement.classList.remove('hidden');
        resultsElement.classList.add('hidden');
        errorElement.classList.add('hidden');
        searchButton.disabled = true;
    }

    // Function to show results
    function showResults(answer, sources) {
        loadingElement.classList.add('hidden');
        resultsElement.classList.remove('hidden');
        errorElement.classList.add('hidden');
        searchButton.disabled = false;
        
        // Display the answer
        answerElement.textContent = answer;
        
        // Display the sources
        sourcesListElement.innerHTML = '';
        if (sources && sources.length > 0) {
            sources.forEach(source => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = source;
                a.target = '_blank';
                a.textContent = source;
                li.appendChild(a);
                sourcesListElement.appendChild(li);
            });
        }
    }

    // Function to show error
    function showError() {
        loadingElement.classList.add('hidden');
        resultsElement.classList.add('hidden');
        errorElement.classList.remove('hidden');
        searchButton.disabled = false;
    }

    // Function to perform the search
    async function performSearch() {
        const query = queryInput.value.trim();
        
        if (!query) {
            return;
        }
        
        showLoading();
        answerElement.textContent = ''; // Clear previous results
        
        try {
            // Create EventSource with POST request
            const response = await fetch('/api/websearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            // Create a reader for the response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // Decode the stream chunk and process each line
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(5));
                            
                            if (data.done) {
                                // Final message with complete results
                                showResults(data.answer, data.sources);
                                return;
                            }
                            
                            if (data.text) {
                                // Streaming chunks of text
                                answerElement.textContent += data.text;
                            }
                            
                            if (data.error) {
                                showError();
                                return;
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showError();
        } finally {
            searchButton.disabled = false;
        }
    }

    // Event listeners
    searchButton.addEventListener('click', performSearch);
    
    queryInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}); 