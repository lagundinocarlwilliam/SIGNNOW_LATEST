const express = require('express');
const router = express.Router();

const { 
    getForm,
    formPost,
    sendToRS,
    getFormRS,
    getFormPIC,
    sendToPIC
} = require('../controllers/signnow.controller');

router.route('/form')
    .get(getForm);

router.route('/form-rs')
    .get(getFormRS);

    router.route('/form-pic')
    .get(getFormPIC);

router.route('/formPost')
    .post(formPost);

router.route('/sendToRS')
    .get(sendToRS);

router.route('/sendToPIC')
    .get(sendToPIC);

module.exports = router;