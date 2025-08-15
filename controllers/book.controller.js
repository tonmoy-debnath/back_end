import Book from '../model/Book.model.js';

export const uploadBook = async (req, res) => {
    try {
        const { type, class: cls, subject, bookname } = req.body;

        if (!req.files || !req.files.cover || !req.files.file) {
            return res.status(400).json({ error: "Cover image or PDF file missing" });
        }

        const coverFile = req.files.cover[0];
        const pdfFile = req.files.file[0];

        if (!coverFile.location || !pdfFile.location) {
            return res.status(500).json({ error: "File upload failed or location missing" });
        }

        const bookData = {
            type,
            class: cls,
            bookname,
            coverUrl: coverFile.location,
            pdfUrl: pdfFile.location
        };

        if (subject && subject.trim() !== '') {
            bookData.subject = subject;
        }

        const book = new Book(bookData);
        await book.save();

        res.status(201).json(book);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
};

export const getBooks = async (req, res) => {
    try {
        const filters = {};
        ['type', 'class', 'subject'].forEach(key => {
            if (req.query[key]) filters[key] = req.query[key];
        });

        const books = await Book.find(filters).sort('-createdAt');
        res.json(books);
    } catch {
        res.status(500).json({ error: 'Server error' });
    }
};
