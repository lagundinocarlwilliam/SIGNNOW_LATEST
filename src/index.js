require('./config/env/dotenv'); // show config variables

const express = require('express');
const path = require('path');
// const cors = require('cors');
// const helmet = require('helmet');
const compression = require('compression');
// const hbs = require('hbs');
// const methodOverride = require('method-override');
const PORT = process.env.PORT || 8000;

const app = express();

// app.use(cors());
// app.use(helmet({ contentSecurityPolicy: false })); // This disables the `contentSecurityPolicy` middleware but keeps the rest.
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static('public'));
// app.use(methodOverride('_method'));

// hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

app.use('/', require('./routes/signnow.routes'));

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});