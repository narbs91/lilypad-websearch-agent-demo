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
        queryInput.disabled = true; // Also disable the input while searching
    }

    // Function to show results
    function showResults(answer, sources) {
        loadingElement.classList.add('hidden');
        resultsElement.classList.remove('hidden');
        errorElement.classList.add('hidden');
        searchButton.disabled = false;
        queryInput.disabled = false; // Re-enable the input
        
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
        queryInput.disabled = false; // Re-enable the input
    }

    // Function to perform the search
    async function performSearch() {
        const query = queryInput.value.trim();
        
        if (!query) {
            return;
        }
        
        try {
            showLoading(); // This now disables both button and input
            answerElement.textContent = ''; // Clear previous results
            
            const response = await fetch('/api/websearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            showResults(data.answer, data.sources);
        } catch (error) {
            console.error('Error:', error);
            showError();
        }
    }

    // NOTE: If you'd instead like to use the streaming endpoint, uncomment the following function and comment out the performSearch function above
    // async function performSearchStream() {
    //     const query = queryInput.value.trim();
        
    //     if (!query) {
    //         return;
    //     }
        
    //     try {
    //         showLoading(); // This now disables both button and input
    //         answerElement.textContent = ''; // Clear previous results
            
    //         const response = await fetch('/api/websearch/stream', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({ query })
    //         });

    //         const data = await response.json();
    //         showResults(data.answer, data.sources);
    //         const reader = response.body.getReader();
    //         const decoder = new TextDecoder();

    //         while (true) {
    //             const { done, value } = await reader.read();
    //             if (done) break;

    //             const chunk = decoder.decode(value);
    //             const lines = chunk.split('\n');
                
    //             for (const line of lines) {
    //                 if (line.startsWith('data: ')) {
    //                     try {
    //                         const data = JSON.parse(line.slice(5));
                            
    //                         if (data.done) {
    //                             showResults(data.answer, data.sources);
    //                             return;
    //                         }
                            
    //                         if (data.text) {
    //                             answerElement.textContent += data.text;
    //                         }
                            
    //                         if (data.error) {
    //                             showError();
    //                             return;
    //                         }
    //                     } catch (e) {
    //                         console.error('Error parsing SSE data:', e);
    //                     }
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         showError();
    //     }
    // }

    // Event listeners
    searchButton.addEventListener('click', performSearch);
    
    queryInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}); 