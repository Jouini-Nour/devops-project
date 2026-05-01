const express = require('express');

const app = express();

app.get('/', (req, res) => {
    res.send('DevOps Pipeline Running');
});

module.exports = app;

if (require.main === module) {
    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
}