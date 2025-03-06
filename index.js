const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv  = require('dotenv');
const cookieParser = require('cookie-parser')
const app = express();
const collection = require('./Schema/user')
const ticketInfo = require('./Schema/ticketInfo');
const nodemailer = require('nodemailer');
const pdfkit = require('pdfkit');
const fs = require('fs');
const QRCode = require('qrcode');

dotenv.config();
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

    res.render('plan_visit',{isLoggedIn});
});

app.get('/plan-your-visit', (req, res) => {
    const isLoggedIn = isLoggedInorNot(req);


    res.render('plan_visit',{isLoggedIn});
});

app.get('/about', (req, res) => {
    const isLoggedIn = isLoggedInorNot(req);

    res.render('about',{isLoggedIn});
    
});

app.get('/contact', (req, res) => {
    const isLoggedIn = isLoggedInorNot(req);

    res.render('contact',{isLoggedIn});
    
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

app.get('/profile', async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login'); // Redirect to login if no token is present
    }

    try {
        // Decode the token
        const decoded = jwt.verify(token, 'secret');
        const email = decoded.email; // Get email from token

        // Find user based on email
        const user = await collection.findOne({ email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        console.log("User found:", user); // Log the user data for debugging

        // Render the profile page with user data
        res.render('profile', { user });

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal Server Error");
    }
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
    if (!user) return res.render('signupError');

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



const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'vishvaraj.dgkgr22@sinhgad.edu',        // Replace with your Gmail
        pass: '****'             // Use App Password if 2FA is enabled
    }
});





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
    
            // Create Ticket
            const ticket = await ticketInfo.create({
                email,
                name,
                date,
                time
            });
        //     const qrData = `https://Magico.com/downloadTicket/${ticket._id}`;  // Or just ticketId
        // const qrCodeDataURL = await QRCode.toDataURL(qrData);
    
            // Send Ticket via Email
            const mailOptions = {
                from: 'vishvaraj.dgkgr22@sinhgad.edu',
                to: email,
                subject: '🎟️ Your Museum Ticket is Confirmed!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">🎉 Thank You for Your Booking!</h2>
            <p>Hi <strong>${ticket.name}</strong>,</p>
            <p>We're excited to confirm your ticket booking. Below are your ticket details:</p>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
                <p><strong>🎫 Ticket ID:</strong> ${ticket._id}</p>
                <p><strong>📅 Date:</strong> ${ticket.date}</p>
                <p><strong>⏰ Time:</strong> ${ticket.time}</p>
             <p><strong>🎟️ Number of Tickets:</strong> ${ticket.numberOfTickets}</p>
                 <p><strong>💰 Total Price:</strong> $${ticket.price}</p>
            </div>

            

            <p style="color: #555;">Please keep this email for your records. Show the QR code at the entrance for a quick check-in.</p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

            <p style="font-size: 12px; color: #999;">If you have any questions, feel free to reply to this email or contact us at support@museum.com.</p>
            <p style="font-size: 12px; color: #999; text-align: center;">Thank you for choosing our museum. We look forward to seeing you!</p>
        </div>
    `,
                
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error("Error sending email:", error);
                } else {
                    console.log("Email sent:", info.response);
                }
            });
    
            res.redirect('/yourTicket'); // Redirect to the ticket page
        } catch (err) {
            console.error("Error submitting ticket:", err);
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).send("Invalid or expired token.");
            }
            res.status(500).send("Internal Server Error");
        }
    });
    
    app.get('/downloadTicket/:ticketId', async (req, res) => {
        const ticketId = req.params.ticketId;
        console.log("Fetching ticket with ID:", ticketId); // Debugging
    
        try {
            const ticket = await ticketInfo.findById(ticketId);
            if (!ticket) {
                console.log("Ticket not found"); // Debugging
                return res.status(404).send('Ticket not found');
            }
            console.log("Ticket data:", ticket); // Debugging
            const qrData = `https://yourwebsite.com/downloadTicket/${ticketId}`;  // Link to download the ticket
            const qrCode = await QRCode.toDataURL(qrData);
            // Create the PDF
            const doc = new pdfkit();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Ticket_${ticketId}.pdf`);
    
            // Pipe the PDF directly to the response
            doc.pipe(res);
    
            // Add content to the PDF
           // Add background color
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#c78c8c'); // Light blue background

// Add a border around the ticket
doc.strokeColor('#333333').lineWidth(5).rect(50, 40, 450, 350).fill('#ffffff').stroke();

// Header
doc.fontSize(20).fillColor('#000000').text('Magico', { align: 'center' });
doc.moveDown(0.5);

// Ticket ID
doc.fontSize(16).fillColor('#111110').text(`Ticket ID: ${ticket._id}`, { align: 'center' });
doc.moveDown(0.5);

// Ticket Details
doc.fontSize(14).fillColor('#2c3e50');
doc.text(`Name: ${ticket.name}`);
doc.text(`Date: ${ticket.date}`);
doc.text(`Time: ${ticket.time}`);
doc.text(`Number of Tickets: ${ticket.numberOfTickets}`);
doc.text(`Price: ${ticket.price}`);
doc.moveDown(1);

// Add a decorative line


// Footer

doc.image(qrCode, {
    fit: [150, 150],
    align: 'center',
    valign: 'center'
});
doc.fontSize(12).fillColor('#2c3e50').text('Thank you for visiting! Enjoy your experience! ');


// Finalize the PDF
doc.end(); // End PDF generation
        } catch (err) {
            console.error('Error generating ticket:', err);
            res.status(500).send('Internal Server Error');
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
        const tickets = await ticketInfo.findOne({ email }).sort({createdAt:-1});

        res.render('ticket', { tickets });
    } catch (err) {
        console.error("Error fetching tickets:", err);
        res.status(500).send("Internal Server Error");
    }
});



// app.get('/availability',(req,res)=>{
//     res.render('check_availability');
// })

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

// const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

// app.post('/verify-payment', (req, res) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
//     const secret = razorpay.key_secret;
//     const body = razorpay_order_id + '|' + razorpay_payment_id;
  
//     try {
//       const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
//       if (isValidSignature) {
//         // Update the order with payment details
//         const orders = readData();
//         const order = orders.find(o => o.order_id === razorpay_order_id);
//         if (order) {
//           order.status = 'paid';
//           order.payment_id = razorpay_payment_id;
//           writeData(orders);
//         }
//         res.status(200).json({ status: 'ok' });
//         console.log("Payment verification successful");
//       } else {
//         res.status(400).json({ status: 'verification_failed' });
//         console.log("Payment verification failed");
//       }
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ status: 'error', message: 'Error verifying payment' });
//     }
//   });
  

// //Razorpay Integration
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const razorpay = new Razorpay({
//     key_id: API_KEY,
//     key_secret: SECRET_KEY,
//   });

// // Function to read data from JSON file
// const readData = () => {
//     if (fs.existsSync('orders.json')) {
//       const data = fs.readFileSync('orders.json');
//       return JSON.parse(data);
//     }
//     return [];
//    };
   
   
//    // Function to write data to JSON file
//    const writeData = (data) => {
//     fs.writeFileSync('orders.json', JSON.stringify(data, null, 2));
//    };
   
   
//    // Initialize orders.json if it doesn't exist
//    if (!fs.existsSync('orders.json')) {
//     writeData([]);
//    }
   
//    app.post('/create-order', async (req, res) => {
//     try {
//       const { amount, currency, receipt, notes } = req.body;
  
//       const options = {
//         amount: amount * 100, // Convert amount to paise
//         currency,
//         receipt,
//         notes,
//       };
  
//       const order = await razorpay.orders.create(options);
      
//       // Read current orders, add new order, and write back to the file
//       const orders = readData();
//       orders.push({
//         order_id: order.id,
//         amount: order.amount,
//         currency: order.currency,
//         receipt: order.receipt,
//         status: 'created',
//       });
//       writeData(orders);
  
//       res.json(order); // Send order details to frontend, including order ID
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Error creating order');
//     }
//   });
//   app.get('/payment-success', (req, res) => {
//     res.sendFile(path.join(__dirname, 'success.html'));
//   });
  


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
