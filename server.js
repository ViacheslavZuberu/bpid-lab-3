const express = require("express");
const bodyParser = require("body-parser");
const random = require("random-number");
const math = require("mathjs");

const PORT = process.env.PORT || 5000;

let randomOptions = {
    min: 25,
    max: 500,
    integer: true
};

function generateRandomPrime() {
    let rand = random(randomOptions);

    while (!math.isPrime(rand)) {
        rand = random(randomOptions);
    }

    return rand;
}

function powmod(a, b, p) {
    let res = 1;
    while (b) {
        if (b & 1) {
            res = +((res * 1 * a) % p);
            b--;
        } else {
            a = +((a * 1 * a) % p);
            b >>= 1;
        }
    }

    return res;
}

function generator(p) {
    let fact = [];
    let phi = p - 1,
        n = phi;
    for (let i = 2; i * i <= n; ++i)
        if (n % i == 0) {
            fact.push(i);
            while (n % i == 0) n /= i;
        }
    if (n > 1) fact.push(n);

    for (let res = 2; res <= p; ++res) {
        let ok = true;
        for (let i = 0; i < fact.length && ok; ++i)
            ok &= powmod(res, phi / fact[i], p) != 1;

        if (ok) return res;
    }
    return -1;
}

let p = generateRandomPrime();
let g = generator(p);

let localDatabase = {
    g: g,
    p: p,
    users: [],
    messages: [],
    archived_messages: []
};

app = express();

app.set("view engine", "jade");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.render("index", {
        title: "Lab Main",
        project_type: "Lab",
        lab_number: 3,
        version: "v1.2",
        local_database: localDatabase
    });
});

app.post("/reg", (req, res) => {
    if (req.body.username) {
        let user = {
            username: req.body.username,
            number: random(randomOptions)
        };
        let changed = false;
        for (let i = 0; i < localDatabase.users.length; i++) {
            if (localDatabase.users[i].username === user.username) {
                changed = true;
                user = localDatabase.users[i];
            }
        }
        if (!changed) {
            localDatabase.users.push(user);
        }
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
        username: req.body.username,
        recepient: req.body.recepient,
        encrypted_message: req.body.encrypted_message
    };
    localDatabase.messages.push(message);
    res.status(201).json({
        status: "OK"
    });
});

app.get("/sync", (req, res) => {
    let messages = localDatabase.messages;
    localDatabase.archived_messages = localDatabase.archived_messages.concat(
        localDatabase.messages
    );
    localDatabase.messages = [];
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
