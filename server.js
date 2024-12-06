const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shorno.420',
    database: 'hotel_booking'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL..:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.post('/api/book', (req, res) => {
    const { guest_name, room_number, check_in_date, check_out_date } = req.body;

    // Log the received data
    console.log('Received booking data:', { guest_name, room_number, check_in_date, check_out_date });

    // Validate input
    if (!guest_name || !room_number || !check_in_date || !check_out_date) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = 'INSERT INTO bookings (guest_name, room_number, check_in_date, check_out_date, status) VALUES (?, ?, ?, ?, "booked")';
    db.query(query, [guest_name, room_number, check_in_date, check_out_date], (err, result) => {
        if (err) {
            console.error('Error booking room:', err);
            res.status(500).json({ error: 'Error booking room', details: err.message });
        } else {
            res.status(201).json({ message: 'Room booked successfully', bookingId: result.insertId });
        }
    });
});


app.put('/api/checkin/:id', (req, res) => {
    const bookingId = req.params.id;
    const query = 'UPDATE bookings SET status = "checked_in" WHERE id = ?';
    db.query(query, [bookingId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error checking in' });
        } else {
            res.json({ message: 'Checked in successfully' });
        }
    });
});

app.put('/api/checkout/:id', (req, res) => {
    const bookingId = req.params.id;
    const query = 'UPDATE bookings SET status = "checked_out" WHERE id = ?';
    db.query(query, [bookingId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Error checking out' });
        } else {
            res.json({ message: 'Checked out successfully' });
        }
    });
});

app.get('/api/bookings', (req, res) => {
    const query = 'SELECT * FROM bookings';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching bookings' });
        } else {
            res.json(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});