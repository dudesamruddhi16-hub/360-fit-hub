const mongoose = require('mongoose');

/**
 * Generic controller factory for CRUD operations
 * Returns middleware functions that can be used with Express routes
 */

// Get all documents
const getAll = (Model) => async (req, res) => {
    try {
        const docs = await Model.find({}).sort({ _id: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get single document by ID
const getById = (Model) => async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const doc = await Model.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(doc);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create new document
const create = (Model) => async (req, res) => {
    try {
        const created = await Model.create(req.body);
        res.status(201).json(created);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update existing document
const update = (Model) => async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const updated = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete document
const remove = (Model) => async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }
        const deleted = await Model.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Query documents by field
const queryByField = (Model) => async (req, res) => {
    try {
        let { field, value } = req.query;

        // Support nested params object
        if (!field && req.query.params) {
            field = req.query.params.field;
            value = req.query.params.value;
        }

        if (!field || typeof value === 'undefined') {
            return res.status(400).json({ error: 'field and value required' });
        }

        console.log(`Querying with field: ${field}, value: ${value}`);

        let query = {};

        // Handle ObjectId fields
        if (field === '_id' || (/Id$/.test(field) && field !== 'userId')) {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return res.status(400).json({ error: 'Invalid ID value' });
            }
            query[field] = value;
        }
        // Handle userId as direct match
        else if (field === 'userId') {
            query[field] = value;
        }
        // Handle other fields with regex
        else {
            const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            query[field] = { $regex: `^${escapeRegex(value)}$`, $options: 'i' };
        }

        const docs = await Model.find(query);
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    queryByField
};
