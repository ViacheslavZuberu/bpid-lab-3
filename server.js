const express = require("express");
const bodyParser = require("body-parser");
const random = require("random-number");

const PORT = process.env.PORT || 5000;

let randomOptions = {
    min: 25,
    max: 500,
    integer: true
};

let localDatabase = {
    g: random(randomOptions),
    p: random(randomOptions),
    users: [],
    messages: [],
    archived_messages: []
};

app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(200).json({
        project_type: "Lab",
        lab_number: 3,
        version: "v1.0",
        local_database: localDatabase
    });
});

app.post("/reg", (req, res) => {
    if (req.body.username) {
        let user = {
            username: req.body.username,
            number: random(randomOptions)
        };
        localDatabase.users.push(user);
        res.status(201).json({
            my_number: user.number,
            g: localDatabase.g,
            p: localDatabase.p
        });
    } else {
        res.status(400).json({
            error: "username field not found!"
        });
    }
});

app.post("/send", (req, res) => {
    let message = {
        sender: req.body.sender,
        sender_number: req.body.sender_number,
        encrypted_message: req.body.encrypted_message
    };
    localDatabase.messages.push(message);
    res.status(201).json({
        status: "OK"
    });
});

app.get("/sync", (req, res) => {
    let messages = localDatabase.messages;
    localDatabase.messages = [];
    localDatabase.archived_messages.push(messages);
    res.status(200).json(messages);
});

app.get("/archive", (req, res) => {
    res.status(200).json(localDatabase.archived_messages);
});

app.get("/users", (req, res) => {
    res.status(200).json({
        users: localDatabase.users
    });
});

app.listen(PORT, function() {
    console.log("API is started on port " + PORT);
});
