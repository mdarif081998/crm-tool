const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client')));

// Helper functions to read and write data
function readData() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Validation rules
const leadValidationRules = [
    body('name').isString().notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').isString().notEmpty().trim().escape(),
    body('status').isIn(['new', 'contacted', 'qualified'])
];

// Validation middleware
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

// Routes
app.get('/leads', (req, res, next) => {
    try{
        res.json(readData());
    } catch (err) {
        next(err);
    }

});

app.post('/leads', leadValidationRules, validate, (req, res, next) => {
    try {
        const leads = readData();
        const newLead = { id: uuidv4(), ...req.body };
        leads.push(newLead);
        writeData(leads);
        res.status(201).json(newLead);
    } catch (err) {
        next(err);
    }

});

app.put('/leads/:id', leadValidationRules, validate, (req, res, next) => {
    try {
        const leads = readData();
        const index = leads.findIndex(lead => lead.id === req.params.id);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...req.body };
            writeData(leads);
            res.json(leads[index]);
        } else {
            res.status(404).json({ error: 'Lead not found' });
        }
    } catch (err) {
        next();
    }
});

app.delete('/leads/:id', (req, res, next) => {
    try{
        let leads = readData();
        leads = leads.filter(lead => lead.id !== req.params.id);
        if (leads.length < readData().length) {
            writeData(leads);
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Lead not found' });
        }
    } catch (err) {
        next(next)
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;