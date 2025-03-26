const express = require('express');
const mongoose = require('mongoose');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const cartRoutes = require('./routes/cartRoutes');
const sessionController = require('./controllers/sessionController');
const bookController = require('./controllers/bookController');
const bodyParser = require('body-parser');
const session = require('express-session');
const store = new session.MemoryStore();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'somesecret',
    cookie: {maxAge: 600000},
    saveUninitialized: false,
    resave: true,
    store
}));



app.use((req, res, next) => {

    res.locals.isAuthenticated = req.session.authenticated || false;
    if(req.session && req.session.user)
    {
        res.locals.userId = req.session.user._id;
        res.locals.email = req.session.user.email;
        res.locals.isAdmin = req.session.user.isAdmin;
        res.locals.username = req.session.user.username;
        res.locals.address = req.session.user.address;
    }
    else
    {
        res.locals.userId = null;
        res.locals.email = null;
        res.locals.isAdmin = false;
        res.locals.username = null;
        res.locals.address = null;
    }

    next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static('public'));


app.set('view engine', 'ejs');


app.get('/session-check', sessionController.sessionCheck); 


const dbURI = '';

mongoose.connect(dbURI).then(result => {
    
    console.log("Connected to db");
    app.listen(3000);
    console.log("Server running on port 3000");

    
}).catch(err => console.log(err));

app.set('view engine', 'ejs');


app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

const aboutRoutes = require('./routes/aboutRoutes');
app.use('/about', aboutRoutes);

app.get('/about', (req, res) => {
    res.render('about', { title: 'About Us' });
});


app.get('/signin', sessionController.signIn);
app.get('/register', sessionController.register);
app.get('/profile', sessionController.profile);
app.get('/changeuserinfo', sessionController.userinfochange);
app.get('/signout', sessionController.sumbitSignOut);
app.get('/admin', sessionController.admin);
app.post('/submitsignin', bodyParser.urlencoded({ extended: false }), sessionController.sumbitSignIn);
app.post('/submitregistration', bodyParser.urlencoded({ extended: false }), sessionController.sumbitRegister)

app.delete('/deleteuser/:id', sessionController.deleteUser);
app.put('/changeuserinfo/:id', sessionController.changeUserData);
app.put('/changepassword', sessionController.submitChangePassword);

app.get('/bestsellers', bookController.bestsellers);

app.get('/', (req, res) => {
    res.redirect('/books');
});

app.use('/books', bookRoutes);

app.use('/users', userRoutes);


app.use('/cart', cartRoutes);



app.use((req, res) => {
    res.status(404).render('404', { title: '404'});
});


const cron = require('node-cron');
const Book = require('./models/book');  
const BackupBook = mongoose.model('BackupBook', new mongoose.Schema({
    title: String,
    description: String,
    imagePath: String,
    createdAt: Date,
    updatedAt: Date
}));

cron.schedule('* * * * *', async () => {

    try {
        console.log("Mentési folyamat indítása...");
        const books = await Book.find();

        for (const book of books) {
            
            await BackupBook.updateOne(
                { _id: book._id }, 
                { $setOnInsert: book }, 
                { upsert: true } 
            );
        }
        
        console.log("Könyvek sikeresen mentve az új bejegyzések hozzáadásával a backupbooks kollekcióba.");
    } catch (error) {
        console.error("Hiba történt a mentés során:", error);
    }
});





//Manuális mentés tesztelés céljából
/*
async function runBackup() {
    try {
        const books = await Book.find();
        await BackupBook.insertMany(books);
        console.log("Könyvek sikeresen mentve a backupbooks kollekcióba");
    } catch (error) {
        console.error("Hiba történt a mentés során:", error);
    }
}

runBackup();  // Ezzel azonnal lefut a mentés tesztelés céljából
*/