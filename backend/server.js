const express=require("express")
const app=express()
const dotenv=require("dotenv").config()
const connectDb=require("./config/connectionDb")
const cors=require('cors')
const nodemailer=require('nodemailer')
const Recipe=require('./models/recipe')

const PORT=process.env.PORT || 5000
connectDb()

app.use(express.json())
app.use(cors())
app.use(express.static("public"))
app.use('/images', express.static('public/images'));



app.use('/', require('./routes/user'))
app.use('/recipe', require('./routes/recipe'))

// Move this route BELOW all middleware
app.post('/send-email', async (req, res) => {
    const { recipient, recipeId } = req.body;
    if (!recipient || !recipeId) {
        return res.status(400).json({ error: "Missing recipient or recipeId" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        return res.status(404).json({ error: "Recipe not Found" });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'madabhushanisrikar@gmail.com',
                pass: 'yqceiwsnwxsnweue', // Use a secure environment variable instead
            },
        });
        const imageUrl = `http://localhost:5173/recipe/${recipeId}`;
const mailOptions = {
    from: "madabhushanisrikar@gmail.com",
    to: recipient,
    subject: 'Recipe Card',
    html: `<h1>${recipe.title}</h1>
           <br>
           <h1> Intredients </h1>
           <p>${recipe.ingredients}</p>
           <p>Time: <b>${recipe.time}</b></p>
           <h1> Instructions</h1>
           <p>${recipe.instructions}</p>
           <p> Want to view with image ? ${imageUrl}</p>
           <div>
           `
};
console.log("Final Email Image URL:", imageUrl);

const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        res.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

app.listen(PORT, (err) => {
    console.log(`Server is listening on port ${PORT}`);
});


