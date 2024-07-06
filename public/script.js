document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const viewForm = document.getElementById('viewForm');
    const pdfList = document.getElementById('pdfList');
    const pdfViewer = document.getElementById('pdfViewer');
    const pdfFrame = document.getElementById('pdfFrame');

    // Function to fetch all PDF IDs and update the list
    async function fetchPdfIds() {
        try {
            const response = await fetch('/get-pdfs');
            if (!response.ok) {
                throw new Error('Failed to fetch PDF IDs');
            }
            const pdfs = await response.json();
            pdfList.innerHTML = ''; // Clear previous list
            pdfs.forEach(pdf => {
                const li = document.createElement('li');
                li.textContent = pdf._id;
                li.style.cursor = 'pointer';
                pdfList.appendChild(li);

                li.addEventListener('click', function() {
                    try {
                        const pdfId = pdf._id;
                        document.getElementById('pdfId').value = pdfId;
                        
                        // Fetch and display the PDF
                        viewForm.dispatchEvent(new Event('submit'));

                    } catch (error) {
                        console.error('Error fetching or displaying PDF:', error);
                    }

                })
            });
        } catch (error) {
            console.error('Error fetching PDF IDs:', error);
        }
    }

    // Function to handle PDF upload form submission
    uploadForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        try {
            const response = await fetch('/upload-pdf', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Failed to upload PDF');
            }
            await fetchPdfIds(); // Update PDF list after successful upload
            this.reset(); // Reset form fields
        } catch (error) {
            console.error('Error uploading PDF:', error);
        }
    });

    // Function to handle PDF view form submission
    viewForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const pdfId = document.getElementById('pdfId').value.trim();
        if (!pdfId) {
            alert('Please enter a PDF ID');
            return;
        }
        try {
            const response = await fetch(`/get-pdf/${pdfId}`);
            if (!response.ok) {
                throw new Error('PDF not found or failed to fetch');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Set iframe src to display the PDF
            pdfFrame.src = url;
            pdfViewer.style.display = 'block'; // Show the PDF viewer
        } catch (error) {
            console.error('Error fetching or displaying PDF:', error);
            alert('PDF not found or error displaying PDF');
        }
    });

    // Initialize PDF list on page load
    fetchPdfIds();
});