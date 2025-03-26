
const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', async (req, res) => {
    try {
        if (!req.session.authenticated || !req.session.user.isAdmin) {
            return res.redirect('/books');
        }
        const users = await User.find();
        res.render('users/users', { users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba történt a felhasználók listázása során');
    }
});

router.get('/new', (req, res) => {
    res.render('users/new');
});


router.post('/', async (req, res) => {
    try {
        const { name, email, password, address, adminPrivileges } = req.body;
        
        const newUser = new User({
            name,
            email,
            password,
            address,
            adminPrivileges: adminPrivileges === 'true'
        });
        newUser.password = newUser.generateHash(newUser.password);

        await newUser.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Hiba történt az új felhasználó hozzáadása során');
    }
});

router.get('/edituser/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('users/edituser', { user });
    } catch (err) {
        res.status(500).send(err.message);
    }
});


router.post('/edituser/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

       
        user.name = req.body.name || user.name;
        user.address = req.body.address || user.address;
        if (req.body.password) {
            user.password = user.generateHash(req.body.password);
        }
        user.adminPrivileges = req.body.adminPrivileges === 'on';


        await user.save();
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send(err.message);
    }
});


module.exports = router;