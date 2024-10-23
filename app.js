const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Initialize SQLite database
db.serialize(() => {
    db.run("CREATE TABLE pokemon (id INTEGER PRIMARY KEY, name TEXT, level INTEGER, type TEXT)");
});

// Route to display all Pokémon
app.get('/', (req, res) => {
    db.all("SELECT * FROM pokemon", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.render('index', { pokemons: rows });
    });
});

// Route to display form to add a new Pokémon
app.get('/new', (req, res) => {
    res.render('new');
});

// Route to handle the submission of a new Pokémon
app.post('/add', (req, res) => {
    const { name, level, type } = req.body;
    db.run("INSERT INTO pokemon (name, level, type) VALUES (?, ?, ?)", [name, level, type], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.redirect('/');
    });
});

// Route to delete a Pokémon
app.post('/delete/:id', (req, res) => {
    const pokemonId = req.params.id;
    db.run("DELETE FROM pokemon WHERE id = ?", pokemonId, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.redirect('/');
    });
});


// Route to display the edit form for a Pokémon
app.get('/edit/:id', (req, res) => {
    const pokemonId = req.params.id;
    db.get("SELECT * FROM pokemon WHERE id = ?", pokemonId, (err, pokemon) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        if (!pokemon) {
            return res.status(404).send('Pokémon not found');
        }
        res.render('edit', { pokemon: pokemon });
    });
});


// Route to handle the submission of the edited Pokémon
app.post('/edit/:id', (req, res) => {
    const pokemonId = req.params.id;
    const { name, level, type } = req.body;
    db.run("UPDATE pokemon SET name = ?, level = ?, type = ? WHERE id = ?", [name, level, type, pokemonId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        res.redirect('/');
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
