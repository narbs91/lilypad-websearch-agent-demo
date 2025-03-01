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
        
        try {
            const response = await fetch('/api/websearch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const data = await response.json();
            showResults(data.answer, data.sources);
        } catch (error) {
            console.error('Error:', error);
            showError();
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