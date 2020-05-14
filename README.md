<div align="center">

# medEasy
[![](https://img.shields.io/badge/Made_with-Nodejs-red?style=for-the-badge&logo=node.js)](https://nodejs.org/en/)
[![](https://img.shields.io/badge/Database-MongoDB-red?style=for-the-badge&logo=mongodb)](mongodb.com "MongoDB")
[![](https://img.shields.io/badge/IDE-Visual_Studio_Code-red?style=for-the-badge&logo=visual-studio-code)](https://code.visualstudio.com/  "Visual Studio Code")
[![](https://img.shields.io/badge/Deployed_on-Heroku-red?style=for-the-badge&logo=heroku)](https://www.heroku.com/  "Heroku")
</div>

An Online E-commerce website for medicines.

## Deployed at

[https://medeasyy.herokuapp.com](https://medeasyy.herokuapp.com/)

- ## For admin side
        Login using
        `email: admin@admin.com`  `password: admin`
    ### or
        on signup enter admin code = `"secretcode"`

- ## For user side
        signup using your valid email-id to recieve order confirmation email.


## Demo
<h2>USER SIDE</h2>
<div align="center">
<hr>
<h2 align="center">Home Page</h2>
<hr>
<img src="./demo/home.png"/>
<br>
<hr>
<h2 align="center">Shopping Cart</h2>
<hr>
<img src="./demo/cart.PNG"/>
<br>
<hr>
<h2 align="center">Orders</h2>
<hr>
<img src="./demo/orders.PNG"/>
<br>
<hr>
<h2 align="center">Order Details</h2>
<hr>
<img src="./demo/order-details.PNG" />
<br>
</div>

<h2>ADMIN SIDE</h2>
<div align="center">
<hr>
<h2 align="center">Dashboard</h2>
<hr>
<img src="./demo/dashboard.png" />
<br>
<hr>
<h2 align="center">Orders</h2>
<hr>
<img src="./demo/admin-orders.png"/>
<br>
<hr>
<h2 align="center">Pending Orders</h2>
<hr>
<img src="./demo/pending-orders.png"/>
<br>



</div>


## To run the project locally
* clone this Repository by `git clone https://github.com/shahshubh/medEasy.git`.
* Inside root directory create a .env file and add these
    - `DATABASEURL=mongodb+srv://shubh:medeasy@cluster0-tikja.mongodb.net/test?retryWrites=true&w=majority`
    - `MAILPASS=your_mail_pass`
        - Also change user field to your email id in routes/shoppingcart.js file on Line 177 and Line 250 .
    - `CAPTCHASECRETKEY=your_secret_key`
    - `CAPTCHASITEKEY=your_site_key` 
        - This is required for google recaptcha on signup page. You need to get your secret key and site key from [here](https://www.google.com/recaptcha/intro/v3.html)
        - If you don't want to do this then leave these two env variables. Only recaptcha won't appear rest application would work fine.
* Now in the terminal run:
    - `npm install` 
    - `node app.js`
* Open your browser and enter url `http://localhost:3000`

## Tech Stack of this Project

* Frontend: Html, Css, JavaScript, Bootstrap
* Backend: Nodejs
* Framework: Expressjs
* Database: MongoDB

## Developers
- [Shubh Shah](https://github.com/shahshubh) - Backend Developer
- [Sakshi Shelar](https://github.com/Sakshi107) - Frontend Developer
- [Hiral Sheth](https://github.com/hiral72) - Frontend Developer