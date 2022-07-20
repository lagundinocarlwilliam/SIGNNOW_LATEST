
require('../config/env/dotenv');
const e = require('express');
const { promisify } = require('../utils/index');
const request = require('request');
var LocalStorage = require('node-localstorage').LocalStorage,
    localStorage = new LocalStorage('./scratch');

let clientId = process.env.CLIENTID;
let clientSecret = process.env.CLIENTSECRET;
let username = process.env.EMAIL;
let password = process.env.PASSWORD;

const api = require('@signnow/api-client')({
    credentials: Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
    production: false,
});

class Signnow {
    getToken() {
        console.log("Get token");
        return new Promise((resolve, reject) => {
            const {
                oauth2: { requestToken: getAccessToken },
            } = api;
            const getAccessToken$ = promisify(getAccessToken);

            getAccessToken$({
                username,
                password,
            }).then(result => {
                var token = result.access_token;
                if (result) {
                    resolve({
                        data: token
                    });
                }
            });
        });
    }

    embeddedSigningInvite(token, docuID, roleIDs) {
        console.log("Embedd signing invite");
        roleIDs = roleIDs.data;
        return new Promise((resolve, reject) => {
            var requestContent = JSON.parse(localStorage.getItem("requestContent"));
            var authToken = 'Bearer ' + token;
            request.post({
                headers: {
                    'Authorization': authToken,
                },
                url: 'https://api-eval.signnow.com/v2/documents/' + docuID + '/embedded-invites',
                body: JSON.stringify({
                    "invites": [
                        {
                            "email": "carlwilliam.lagundino@cebupacificair.com",
                            "role_id": roleIDs["signer1"],
                            "order": 1,
                            "auth_method": "none"
                        },
                        {
                            "email": requestContent.rsEmail,
                            "role_id": roleIDs["signer2"],
                            "order": 2,
                            "auth_method": "none"
                        },
                        {
                            "email": requestContent.picEmail,
                            "role_id": roleIDs["signer3"],
                            "order": 3,
                            "auth_method": "none"
                        }
                    ]
                })
            }, function (error, response, body) {
                var bodyContent = JSON.parse(body);
                var data = bodyContent.data;
                var filedinviteIDs = {};
                var count = 0;

                for (var i = 0; i < data.length; i++) {
                    count++;
                    var dataItem = data[i];
                    var fieldInviteKey = "signer_" + count + "_fieldInviteID"
                    filedinviteIDs[fieldInviteKey] = dataItem.id;
                }

                if (filedinviteIDs) {
                    resolve({
                        data: filedinviteIDs
                    });
                }
            });
        });
    }

    getDocumentDetails(token, docuID) { // USE to get role ID
        console.log("Getting Document details");
        return new Promise((resolve, reject) => {
            var authToken = 'Bearer ' + token;
            request.get({
                headers: {
                    'Authorization': authToken,
                },
                url: 'https://api-eval.signnow.com/document/' + docuID,
                body: null
            }, function (error, response, body) {
                var bodyData = JSON.parse(body);
                var count = 0;
                var roleIDArr = {};

                for (var i = 0; i < bodyData.roles.length; i++) {
                    count++;
                    var dataItem = bodyData.roles[i];
                    var roleKey = "signer" + count;
                    roleIDArr[roleKey] = dataItem.unique_id;
                }

                if (roleIDArr) {
                    console.log("done getting details");
                    resolve({
                        data: roleIDArr
                    });
                }

            });
        });
    }

    generateLink(token, docuID, UserInvitefieldID) { // USE to get role ID
        console.log("Generating link");
        return new Promise((resolve, reject) => {
            var authToken = 'Bearer ' + token;
            request.post({
                headers: {
                    'Authorization': authToken,
                },

                url: 'https://api-eval.signnow.com/v2/documents/' + docuID + '/embedded-invites/' + UserInvitefieldID + '/link',
                body: JSON.stringify({
                    "auth_method": "none",
                    "link_expiration": 45
                })
            }, function (error, response, body) {
                var dataBody = JSON.parse(body);
                dataBody = dataBody.data.link;

                if (dataBody) {
                    console.log("done generating link");
                    resolve({
                        data: dataBody
                    });
                }
            });
        });
    }

    sendNotification(Email, link, locallink) { // USE to get role ID
        console.log("Sending Notification to next signer");
        request.post({
            headers: {
                'content-type': 'application/json'
            },
            url: 'https://prod-06.southeastasia.logic.azure.com:443/workflows/3ebe7e49bddb4fec89be15bd3daf443f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=o8MiWc1aFHt4HQTJlWQqb55wd3baIm2F24cQG_HWD2o',
            body: JSON.stringify({
                "email": Email,
                "link": link,
                "localLink": locallink
            })
        });
    }

    createDocumentFromTemplate(token, templateID) {
        console.log("Create Document from template");
        return new Promise((resolve, reject) => {
            request.post({
                headers: {
                    'Authorization': "Bearer " + token,
                    'content-type': 'application/json'
                },
                url: 'https://api-eval.signnow.com/template/' + templateID + '/copy',
                body: JSON.stringify({
                    "document_name": "Enotoc Document"
                })
            }, function (error, response, body) {
                var document = JSON.parse(body);
                var docuID = document.id;
                console.log(docuID);
                if (docuID) {
                    resolve({
                        data: docuID
                    });
                }
            });
        });
    }

    addFields(token, docuID) {
        return new Promise((resolve, reject) => {
            console.log('Start Adding Fields');
            var authToken = 'Bearer ' + token;
            request.put({
                headers: {
                    'content-type': 'application/json',
                    'Authorization': authToken,
                },
                url: 'https://api-eval.signnow.com/document/' + docuID,
                body: JSON.stringify({
                    "client_timestamp": 1527859375,
                    "fields": [
                        {
                            "page_number": 0,
                            "type": "text",
                            "name": "FieldName1",
                            "role": "Signer 1",
                            "required": true,
                            "height": 25,
                            "width": 155,
                            "x": 130,
                            "y": 335
                        },
                        {
                            "page_number": 0,
                            "type": "signature",
                            "name": "FieldName2",
                            "role": "Signer 1",
                            "required": true,
                            "height": 27,
                            "width": 137,
                            "x": 150,
                            "y": 362
                        },
                        {
                            "page_number": 0,
                            "type": "text",
                            "name": "FieldName3",
                            "role": "Signer 2",
                            "required": true,
                            "height": 25,
                            "width": 138,
                            "x": 150,
                            "y": 409
                        },
                        {
                            "page_number": 0,
                            "type": "signature",
                            "name": "FieldName4",
                            "role": "Signer 2",
                            "required": true,
                            "height": 25,
                            "width": 118,
                            "x": 170,
                            "y": 438
                        },
                        {
                            "page_number": 0,
                            "type": "text",
                            "name": "FieldName5",
                            "role": "Signer 3",
                            "required": true,
                            "height": 25,
                            "width": 135,
                            "x": 153,
                            "y": 490
                        },
                        {
                            "page_number": 0,
                            "type": "signature",
                            "name": "FieldName6",
                            "role": "Signer 3",
                            "required": true,
                            "height": 25,
                            "width": 118,
                            "x": 170,
                            "y": 517
                        }
                    ]
                })
            }, function (error, response, body) {
                console.log("Done adding fields");
                if (body) {
                    resolve({
                        data: body
                    });
                }
            });
        });
    }
}

module.exports = Signnow;