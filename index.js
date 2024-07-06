const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());  

app.use(express.static('public'));

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
});

// Define a schema
const pdfSchema = new mongoose.Schema({
    pdf: {
        type: Buffer,
        required: true
    }
});

// Create a model
const Pdf = mongoose.model('Pdf', pdfSchema);

// Setup Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to upload PDF
app.post('/upload-pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const newPdf = new Pdf({ pdf: req.file.buffer });
        await newPdf.save();

        res.status(201).send('PDF uploaded successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to get PDF
app.get('/get-pdf/:id', async (req, res) => {
    try {
        const pdfDoc = await Pdf.findById(req.params.id);
        if (pdfDoc) {
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfDoc.pdf);
        } else {
            res.status(404).send('PDF not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Endpoint to get all PDF IDs  
app.get('/get-pdfs', async (req, res) => {
    try {
        const pdfs = await Pdf.find({}, '_id');
        res.status(200).json(pdfs);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
