import { StorageManager } from './storage.js';

class NotesManager {
    constructor(userId) {
        this.userId = userId;
        this.notes = StorageManager.getItem(`notes_${userId}`, []);
        this.initializeEventListeners();
        this.currentNoteId = null;
    }

    initializeEventListeners() {
        const newNoteBtn = document.getElementById('newNoteBtn');
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        const notesBtn = document.getElementById('notesBtn');

        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.resetNoteForm());
        }

        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => this.saveNote());
        }

        if (notesBtn) {
            notesBtn.addEventListener('click', () => this.displayNotes());
        }
    }

    resetNoteForm() {
        this.currentNoteId = null;
        const noteTitleInput = document.getElementById('noteTitle');
        const noteContentDiv = document.getElementById('noteContent');
        if (noteTitleInput) noteTitleInput.value = '';
        if (noteContentDiv) noteContentDiv.innerHTML = '';
    }

    addNote(title, content) {
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: new Date().toISOString()
        };
        this.notes.unshift(newNote);
        this._save();
        return newNote;
    }

    updateNote(id, title, content) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            note.title = title;
            note.content = content;
            this._save();
        }
    }

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this._save();
        this.displayNotes();
    }

    saveNote() {
        const noteTitleInput = document.getElementById('noteTitle');
        const noteContentDiv = document.getElementById('noteContent');

        const title = noteTitleInput.value.trim();
        const content = noteContentDiv.innerHTML.trim();

        if (!title || !content) {
            alert('Please enter both title and content');
            return;
        }

        if (this.currentNoteId) {
            this.updateNote(this.currentNoteId, title, content);
        } else {
            this.addNote(title, content);
        }

        this.displayNotes();
        if (window.updateDashboard) {
            window.updateDashboard(this, window.tasks);
        }
    }

    displayNotes() {
        const notesList = document.getElementById('notesList');
        if (!notesList) return;

        notesList.innerHTML = '';
        this.notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note-item');
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</p>
                <button class="delete-note" data-id="${note.id}">Delete</button>
            `;

            noteElement.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-note')) {
                    this.currentNoteId = note.id;
                    document.getElementById('noteTitle').value = note.title;
                    document.getElementById('noteContent').innerHTML = note.content;
                }
            });

            const deleteBtn = noteElement.querySelector('.delete-note');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNote(e.target.dataset.id);
                if (window.updateDashboard) {
                    window.updateDashboard(this, window.tasks);
                }
            });

            notesList.appendChild(noteElement);
        });
    }

    _save() {
        StorageManager.setItem(`notes_${this.userId}`, this.notes);
    }
}

export { NotesManager };