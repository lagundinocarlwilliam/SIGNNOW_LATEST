
const e = require('express');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');
const Signnow = require('../models/signnow');

const getForm = (req, res) => {
    var srcPath = "C:/UI Testing/SIGNNOW_UPDATED/src/";
    res.sendFile(srcPath + '/public/index.html');
}

const getFormRS = (req, res) => {
    var link = localStorage.getItem("rsLink");
    res.render("Enotoc-Form-RS", { urlLink: link, name: "RAMP SUPERVISOR" });
}

const getFormPIC = (req, res) => {
    var link = localStorage.getItem("picLink");
    res.render("Enotoc-Form-RS", { urlLink: link, name: "PIC SUPERVISOR" });
}

const formPost = (req, res) => {
    console.log("Creating document from template");
    let signnow = new Signnow();

    localStorage.setItem("requestContent", JSON.stringify(req.body));

    signnow.getToken().then(response => {
        console.log(response.data);
        var token = response.data;
        var templateID = "fb969d4140bb46d882d5cb556e6cbc878cb61138";

        signnow.createDocumentFromTemplate(token, templateID).then(response => {
            var docuID = response.data;
            localStorage.setItem("docuID", docuID);
            signnow.addFields(token, docuID).then(() => {
                signnow.getDocumentDetails(token, docuID).then(response => {
                    var roleIDs = response;
                    signnow.embeddedSigningInvite(token, docuID, roleIDs).then(response => {
                        var dataContent = response.data;
                        localStorage.setItem("inviteID", JSON.stringify(dataContent));

                        signnow.generateLink(token, docuID, dataContent["signer_1_fieldInviteID"]).then(response => {
                            var link = response.data;
                            res.render("Enotoc-Form", { urlLink: link });
                        });
                    });
                });
            });
        });
    });
}

const sendToRS = (req, res) => {
    console.log('---SECOND SIGNER---');
    var fieldInviteID = JSON.parse(localStorage.getItem("inviteID"));
    var requestContent = JSON.parse(localStorage.getItem("requestContent"));
    let signnow = new Signnow();

    signnow.getToken().then(response => {
        var token = response.data;
        var docuID = localStorage.getItem("docuID");
        signnow.generateLink(token, docuID, fieldInviteID["signer_2_fieldInviteID"]).then(response => {
            console.log("rs link generated");
            var link = response.data;
            localStorage.setItem("rsLink", link);

            signnow.sendNotification(requestContent.rsEmail, link, "http://localhost:8000/form-rs");
        });
    });
}

const sendToPIC = (req, res) => {
    console.log('---THIRD SIGNER---');
    var fieldInviteID = JSON.parse(localStorage.getItem("inviteID"));
    var requestContent = JSON.parse(localStorage.getItem("requestContent"));
    let signnow = new Signnow();

    signnow.getToken().then(response => {
        var token = response.data;
        var docuID = localStorage.getItem("docuID");
        signnow.generateLink(token, docuID, fieldInviteID["signer_3_fieldInviteID"]).then(response => {
            console.log("rs link generated");
            var link = response.data;
            localStorage.setItem("picLink", link);

            signnow.sendNotification(requestContent.rsEmail, link, "http://localhost:8000/form-pic");
        });
    });
}

module.exports = {
    getForm,
    formPost,
    sendToRS,
    getFormRS,
    getFormPIC,
    sendToPIC
}