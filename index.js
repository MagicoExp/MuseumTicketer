const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const app = express();
// const collection = require('./Schema/user')
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


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});