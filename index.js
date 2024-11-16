const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
const collection = require('./Schema/user')
// const post = require('./Schema/post');
// const { userInfo } = require('os');
// const { log } = require('console');
const port = 3001;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'public' )));
app.set('view engine','ejs');
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/plan-your-visit',(req,res)=>{
    res.render('plan_visit');
});

app.get('/about',(req,res)=>{
    res.render('about');
});

app.get('/contact',(req,res)=>{
    res.render('contact');
});

app.get('/login',(req,res)=>{
     res.render('login');
    //res.send("Login Page ayega idhar");
});
app.get('/signup',(req,res)=>{  
    res.render('signup');
    
});


app.get('/logout',(req,res)=>{
    res.send("phirse login kro")
});

app.get('/profile',(req,res)=>{
    res.send("Profile Page ayega idhar");
});

app.get('/events',(req,res)=>{
    res.render('events');
});


app.post('/signup' ,async (req,res) =>{
    let {username,email,phone,password} = req.body;
    const user =await collection.findOne({username});
    if(user)
        return res.send('user exist');

    bcrypt.genSalt(10,(err,salt)=>{
        // console.log(salt);            
        bcrypt.hash(password,salt,async (err,hash)=>{
            const user = await collection.create({
                username,
                email,
                password:hash,
                phoneNumber:phone
            })
            let token = jwt.sign({email:email},'secret');
            res.cookie('token',token);
            res.redirect('login'); 
            
        })  
    })  
})

app.post('/login',async (req,res)=>{
    const {username,password,email} = req.body;
    let user = await collection.findOne({username});
    if(!user) return res.send('Pls Sign in ');

    bcrypt.compare(password,user.password, (err,result)=>{
        // console.log(err);
        
        if(result){
            let token = jwt.sign({email:email} ,'secret');
            res.cookie('token',token);
            res.redirect('/profile')
        }else{
            res.redirect('/login');
        }
    })

    
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});