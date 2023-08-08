const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const { findByIdAndUpdate } = require('../models/User');

// ROUTE-1: Get all notes using: GET "/api/notes/fetchallnotes". login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        // Fetch all notes from the database where the user field matches the user's ID.
        const notes = await Note.find({ user: req.user.id });

        // Respond with the notes in JSON format.
        res.json(notes);
    } catch (error) {
        // If an error occurs during fetching the notes, respond with an error message.
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
})


// ROUTE-2: Add a new note using: POST "/api/notes/addnote". login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'description should be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    //taking out from body
    try {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.send({ errors: result.array() });
        }
        const { title, description, tag } = req.body;
        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote);
    } catch (error) {
        // If an error occurs during fetching the notes, respond with an error message.
        console.log(error)
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
})




// ROUTE-3: update an existing note using: PUT "/api/notes/updatenote". login required

router.put('/updatenote/:id', fetchuser, async (req, res) => {   // for updation we use put
    try {
        const { title, description, tag } = req.body
        //create a new noteobject
        const newnote = {};

        if (title) {
            newnote.title = title;
        }
        if (description) {
            newnote.description = description;
        }
        if (tag) {
            newnote.tag = tag;
        }

        //find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) { return req.status(404).send("Not Found") }
        //Allow updation only if user own's this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }
        note = await Note.findByIdAndUpdate(req.params.id, { $set: newnote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Failed to update the note' });

    }

})


// ROUTE-4: deleting note using: DELETE "/api/notes/deletenote". login required

router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    //taking out from body
    try {
        //find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }

        //Allow deletion only if user own's this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note })
    } catch (error) {
        // If an error occurs during fetching the notes, respond with an error message.
        console.log(error)
        res.status(500).json({ error: 'Failed to delete the note', });
    }
})


module.exports = router