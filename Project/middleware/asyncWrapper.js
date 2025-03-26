const asyncWrapper = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => {
            console.error(err);
            res.status(500).send('An error occurred while processing the request');
        });
    };
};

module.exports = asyncWrapper;