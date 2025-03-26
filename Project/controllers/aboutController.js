exports.getAboutPage = (req, res) => {
    res.render('about', {
        title: 'About Us',
        description: 'This is the about page for our project.'
    });
};
