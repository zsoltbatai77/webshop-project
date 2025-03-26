const express = require('express');
const User = require('../models/user');
const Book = require('../models/book');
const asyncWrapper = require('../middleware/asyncWrapper');
const cookieParser = require('cookie-parser');
const { render } = require('ejs');

const app = express();
app.use(cookieParser());


const signIn = asyncWrapper(async (req, res) => {
    if (req.session.authenticated) {
        app.locals.isAuthenticated = req.session.authenticated;
        return res.redirect('/books');
    }
    const users = await User.find();
    res.render('signin', { users, title: 'Signin'});
});


const register = asyncWrapper(async (req, res) => {
    if (req.session.authenticated) {
        app.locals.isAuthenticated = req.session.authenticated;
        return res.redirect('/books');
    }
    const users = await User.find();
    res.render('registration', { users, title: 'Register'});
});


const profile = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated) {
        app.locals.isAuthenticated = req.session.authenticated;
        return res.redirect('/books');
    }
    const users = await User.find();
    res.render('profile', { users, title: 'Profile'});
});


const userinfochange = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated) {
        app.locals.isAuthenticated = req.session.authenticated;
        return res.redirect('/books');
    }
    const users = await User.find();
    res.render('userinfochange', { users, title: 'Information Change'});
});


const admin = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        app.locals.isAuthenticated = req.session.authenticated;
        return res.redirect('/books');
    }
    const users = await User.find();
    const books = await Book.find();
    res.render('admin', { users,  books, title: 'Administration'});
});

function validateCookie(req, res, next) {
    const { cookies } = req;
    if ('session_id' in cookies) {
        if (cookies.session_id === req.sessionID) {
            return next();
        }
    }
    return res.status(403).send("user not validated");
}


const sumbitSignIn = asyncWrapper(async (req, res) => {
    if (req.session.authenticated) {
        return res.redirect('/books');
    } else {
        const users = await User.find({ email: req.body.email });
        if (users.length > 0) {
            if (users[0].validPassword(req.body.password)) {
                req.session.authenticated = true;

                

                if (!req.session.user) { req.session.user = {};}

                req.session.user._id = users[0]._id;
                req.session.user.email = users[0].email;
                req.session.user.isAdmin = users[0].adminPrivileges;
                req.session.user.username = users[0].name;
                req.session.user.address = users[0].address;

                res.cookie('session_id', req.sessionID);
                if(users[0].adminPrivileges) return res.redirect('/admin');
                return res.redirect('/books');
            } else {
                return res.status(403).send("Incorrect password.");
            }
        } else {
            return res.status(403).send("An account with this E-mail address does not exist.");
        }
    }
});


const sumbitRegister = asyncWrapper(async (req, res) => {
    var user = new User({
        email: req.body.email,
        name: req.body.username,
        password: req.body.password,
        address: null,
        adminPrivileges: false
    });
    user.password = user.generateHash(user.password);
    await User.create(user);

    req.session.authenticated = true;

    if (!req.session.user) { req.session.user = {};}

    req.session.user._id = user._id;
    req.session.user.email = user.email;
    req.session.user.isAdmin = user.adminPrivileges;
    req.session.user.username = user.name;
    req.session.user.address = user.address;

    res.cookie('session_id', req.sessionID);
    res.redirect('/books');
});


const sumbitSignOut = asyncWrapper(async (req, res) => {

    req.session.authenticated = false;

    if (!req.session.user) { req.session.user = {};}

    req.session.user._id = null;
    req.session.user.email = null;
    req.session.user.isAdmin = false;
    req.session.user.username = null;
    req.session.user.address = null;

    req.session.destroy;
    res.clearCookie('session_id');
    res.redirect('/books');
});

r
const registerUser = asyncWrapper(async (req, res) => {
    await User.create(req.body);
    res.status(201).send('successful registration');
});


const changeUserData = asyncWrapper(async (req, res) => {

    const { id } = req.params;
    const result = await User.findByIdAndUpdate(id, req.body, { new: true });

    req.session.user.email = req.body.email;
    req.session.user.username = req.body.name;
    req.session.user.address = req.body.address;

    if (!result) {
        return res.status(404).send('User not found');
    }
    res.status(200).json({message:'Data updated successfully'});
});


const submitChangePassword = asyncWrapper(async (req, res) => {
    const users = await User.find({ email: req.session.user.email });
    if (users.length > 0) {
        if (users[0].validPassword(req.body.oldPassword)){
            var tempUserForHashing = new User;
            const result = await User.findByIdAndUpdate(users[0]._id, {password: tempUserForHashing.generateHash(req.body.newPassword)}, { new: true });

            if (!result) {
                return res.status(404).send('User not found');
            }
            res.status(200).json({message:'Data updated successfully'});

        } else {
            return res.status(403).send("Incorrect password.");
        }
    } else {
        return res.status(401).send("An account with this E-mail address does not exist.");
    }
});


const deleteUser = asyncWrapper(async (req, res) => {
    if (!req.session.authenticated || !req.session.user.isAdmin) {
        return res.redirect('/books');
    }
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);

    if (!result) {
        return res.status(404).send('User not found');
    }
    res.status(200).send('User deleted successfully');
});


const sessionCheck = (req, res) => {
    if (req.session.authenticated) {
        res.send("Session is active. User is authenticated.");
    } else {
        res.send("Session is inactive. User is not authenticated.");
    }
};


module.exports = {
    validateCookie,
    signIn,
    register,
    profile,
    userinfochange,
    submitChangePassword,
    admin,
    sumbitSignIn,
    sumbitRegister,
    sumbitSignOut,
    registerUser,
    changeUserData,
    deleteUser,
    sessionCheck,
};
