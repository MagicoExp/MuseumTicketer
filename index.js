const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const collection = require('./Schema/user')
const ticketInfo = require('./Schema/ticketInfo');


const port = 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(cookieParser());

function isLoggedInorNot(req){
    const token = req.cookies.token;
    // let isLoggedIn = false;

    if (token) {
        try {
            jwt.verify(token, 'secret');
            // isLoggedIn = true;
            return true;
        } catch (err) {
            console.error("Invalid token:", err);
        }
    } else{
        return false;
    }
}

app.get('/', (req, res) => {
    // const token = req.cookies.token;
    // let isLoggedIn = false;

    // if (token) {
    //     try {
    //         jwt.verify(token, 'secret');
    //         isLoggedIn = true;
    //     } catch (err) {
    //         console.error("Invalid token:", err);
    //     }
    // }
    const isLoggedIn = isLoggedInorNot(req);

    res.render('home', { isLoggedIn });
});

app.get('/events', (req, res) => {
    const isLoggedIn = isLoggedInorNot(req);

    res.render('events',{isLoggedIn});
});

app.get('/plan-your-visit', (req, res) => {
    const isLoggedIn = isLoggedInorNot(req);


    res.render('plan_visit',{isLoggedIn});
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/login', (req, res) => {
    res.render('login');
    //res.send("Login Page ayega idhar");
});
app.get('/signup', (req, res) => {
    res.render('signup');

});


app.get('/logout', (req, res) => {
    res.cookie('token' , '');
    res.redirect('login');
});

app.get('/profile', (req, res) => {
    res.send("Profile Page ayega idhar");
});

app.get('/events', (req, res) => {
    res.render('events');
});


app.post('/signup', async (req, res) => {
    let { username, email, phone, password } = req.body;
    const user = await collection.findOne({ username });
    if (user)
        return res.send('user exist');

    bcrypt.genSalt(10, (err, salt) => {
        // console.log(salt);            
        bcrypt.hash(password, salt, async (err, hash) => {
            const user = await collection.create({
                username,
                email,
                password: hash,
                phoneNumber: phone
            })
            let token = jwt.sign({ email: email }, 'secret');
            res.cookie('token', token);
            res.redirect('login');

        })
    })
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    let user = await collection.findOne({ username });
    if (!user) return res.send('Sign up krr l*de');

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            const token = jwt.sign({ email: user.email }, 'secret'); 
            res.cookie('token', token);
            console.log("Token created and sent to browser:", token);
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });
});




app.get('/userInputTicket', (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, 'secret');
        const userEmail = decoded.email;

        console.log("Decoded email:", userEmail);

       
        res.render('userTicketInput', { userEmail });
    } catch (err) {
        console.error("Error decoding token:", err);
        res.status(500).send("Fuck u Error");
    }
});



const arr = [];


app.post('/submit', async (req, res) => {
    try {
        const token = req.cookies.token; 
        if (!token) {
            return res.status(401).send("You must be logged in to submit a ticket.");
        }

        const decoded = jwt.verify(token, 'secret');  
        const email = decoded.email;

        if (!email) {
            return res.status(400).send("Email is required.");
        }

        const { name, date, time } = req.body;
        const ticket = await ticketInfo.create({
            email,
            name,
            date,
            time
        });

        res.redirect('/yourTicket');
    } catch (err) {
        console.error("Error submitting ticket:", err);
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).send("Invalid or expired token.");
        }

        res.status(500).send("Internal Server Error");
    }
});




app.get('/yourTicket', async (req, res) => {
    try {
        
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/login'); // Redirect 
        }

        const decoded = jwt.verify(token, 'secret');
        const email = decoded.email;

        // Fetch tickets for this email
        const tickets = await ticketInfo.find({ email });

        res.render('ticket', { tickets });
    } catch (err) {
        console.error("Error fetching tickets:", err);
        res.status(500).send("Internal Server Error");
    }
});



app.get('/availability',(req,res)=>{
    res.render('check_availability');
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});