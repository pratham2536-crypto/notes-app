// Initialize Feather Icons
feather.replace();

// State
let notes = JSON.parse(localStorage.getItem('journal-notes')) || [];
let activeNoteId = null;
let saveTimeout = null;

// DOM Elements
const notesListEl = document.getElementById('notes-list');
const newNoteBtn = document.getElementById('new-note-btn');
const searchInput = document.getElementById('search-input');
const editorContainer = document.getElementById('editor');
const emptyState = document.getElementById('empty-state');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput = document.getElementById('note-body');
const noteDateEl = document.getElementById('note-date');
const saveStatusEl = document.getElementById('save-status');
const deleteNoteBtn = document.getElementById('delete-note-btn');
const focusBtn = document.getElementById('focus-btn');
const wordCountEl = document.getElementById('word-count');
const charCountEl = document.getElementById('char-count');

// --- Utilities ---

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const saveNotesToStorage = () => {
    localStorage.setItem('journal-notes', JSON.stringify(notes));
};

const updateStats = () => {
    const text = noteBodyInput.value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    charCountEl.textContent = `${charCount} characters`;
    wordCountEl.textContent = `${wordCount} words`;
};

// --- Note Management ---

const createNewNote = () => {
    const newNote = {
        id: generateId(),
        title: '',
        body: '',
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(newNote); // Add to top
    saveNotesToStorage();
    renderNotesList();
    setActiveNote(newNote.id);
};

const deleteActiveNote = () => {
    if (!activeNoteId) return;
    
    notes = notes.filter(n => n.id !== activeNoteId);
    saveNotesToStorage();
    
    activeNoteId = null;
    renderNotesList();
    showEmptyState();
};

const updateActiveNote = () => {
    if (!activeNoteId) return;
    
    const noteIndex = notes.findIndex(n => n.id === activeNoteId);
    if (noteIndex === -1) return;
    
    notes[noteIndex].title = noteTitleInput.value;
    notes[noteIndex].body = noteBodyInput.value;
    notes[noteIndex].updatedAt = new Date().toISOString();
    
    // Sort notes by updated date (newest first)
    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    saveNotesToStorage();
    renderNotesList();
    
    // Show saved status
    saveStatusEl.classList.add('visible');
    setTimeout(() => {
        saveStatusEl.classList.remove('visible');
    }, 2000);
};

const handleInput = () => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    updateStats();
    
    // Auto-save after 500ms of inactivity
    saveTimeout = setTimeout(() => {
        updateActiveNote();
    }, 500);
};

// --- UI Rendering ---

const showEmptyState = () => {
    editorContainer.style.display = 'none';
    emptyState.style.display = 'flex';
};

const showEditor = () => {
    emptyState.style.display = 'none';
    editorContainer.style.display = 'flex';
};

const setActiveNote = (id) => {
    activeNoteId = id;
    const note = notes.find(n => n.id === id);
    
    if (note) {
        noteTitleInput.value = note.title;
        noteBodyInput.value = note.body;
        noteDateEl.textContent = `Last edited ${formatDate(note.updatedAt)}`;
        updateStats();
        showEditor();
        renderNotesList(); // re-render to update active class
    } else {
        showEmptyState();
    }
};

const renderNotesList = (filterText = '') => {
    notesListEl.innerHTML = '';
    
    const filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(filterText.toLowerCase()) || 
        n.body.toLowerCase().includes(filterText.toLowerCase())
    );
    
    if (filteredNotes.length === 0) {
        notesListEl.innerHTML = `<div style="color: var(--text-muted); text-align: center; padding: 20px; font-size: 0.85rem;">No notes found</div>`;
        return;
    }
    
    filteredNotes.forEach(note => {
        const title = note.title.trim() === '' ? 'Untitled Note' : note.title;
        const preview = note.body.trim() === '' ? 'No additional text' : note.body;
        
        const noteEl = document.createElement('div');
        noteEl.className = `note-item ${note.id === activeNoteId ? 'active' : ''}`;
        noteEl.onclick = () => setActiveNote(note.id);
        
        noteEl.innerHTML = `
            <div class="note-item-title">${title}</div>
            <div class="note-item-preview">${preview}</div>
            <div class="note-item-date">${formatDate(note.updatedAt)}</div>
        `;
        
        notesListEl.appendChild(noteEl);
    });
};

// --- Event Listeners ---

newNoteBtn.addEventListener('click', createNewNote);
deleteNoteBtn.addEventListener('click', deleteActiveNote);
focusBtn.addEventListener('click', () => {
    document.body.classList.toggle('focus-mode');
});

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    document.body.style.setProperty('--mouse-x', `${x}px`);
    document.body.style.setProperty('--mouse-y', `${y}px`);
});

noteTitleInput.addEventListener('input', handleInput);
noteBodyInput.addEventListener('input', handleInput);

searchInput.addEventListener('input', (e) => {
    renderNotesList(e.target.value);
});

// Initialize app
const init = () => {
    renderNotesList();
    if (notes.length > 0) {
        // Optionally auto-select the first note
        // setActiveNote(notes[0].id);
        showEmptyState();
    } else {
        showEmptyState();
    }
};

init();
