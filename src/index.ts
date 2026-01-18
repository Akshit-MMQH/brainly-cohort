import express = require("express");
import { ContentModel, LinkModel, UserModel } from "./db.js";
import { connect } from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config.js";
import "dotenv/config";
import { Auth } from "./middleware.js";
import { random } from "./generateRandom.js";


const app = express();

async function start() { 
    await connect(process.env.MONGO_DB_URL as string);
}
start();

app.use(express.json());

app.post('/api/v1/signup', async (req, res) => {
    
    const username = req.body.username;
    const password = req.body.password;

    try{

    await UserModel.create({
        username: username,
        password: password
    })

    res.json({
        message: "you are signed up !!"
    })
    } catch(e) {
        res.status(411).json({
            message: "User already exist !!"
        })
    }   

})

app.post('/api/v1/signin', async (req, res) => {

    const { username, password } = req.body;

    const ExistingUser = await UserModel.findOne({username, password});

    if(ExistingUser){
        const token = jwt.sign({
            id : ExistingUser._id
        }, JWT_SECRET)

        res.json({
            // ExistingUser,
            token : token
        })
    } else {
        res.status(403).json({
            message: "The user does not exist !!"
        })
    }

})

app.post('/api/v1/content', Auth, async (req, res) => {
    const { link, title } = req.body;

    await ContentModel.create({
        link,
        title,
        userId: req.userId,
        tag: []
    })
    res.json({
        msg: "New Content Created !!"
    })
})

app.get('/api/v1/content', Auth, async function (req, res) {
    //@ts-ignore
    const userId = req.userId;
    const Content = await ContentModel.findOne({userId}).populate("userId", "username")

    if(Content) {
        res.json({
            Content
        })
    } else {
        res.status(403).json({
            msg: "Content with this title does not exist !!"
        })
    }
    
})

app.post('/api/v1/brain/share', Auth, async function(req, res) {
    const share = req.body.share;

    if(share){

        const hash = random(10);

        await LinkModel.create({
            userId: req.userId,
            hash: hash
        }) 
        res.json({
            message: "Link has been created !!",
            hash : ` ${hash} this is your link`
        })
    } else {
            await LinkModel.deleteOne({
                userId: req.userId
            })
            res.json({
                message: "Removed link !!"
            })
        }
    
})

app.get('/api/v1/brain/:sharelink', Auth, async function (req, res) {
    const hash = req.params.sharelink!;
    
    const link = await LinkModel.findOne({
        hash,
    });

    if(!link) {
        res.status(411).json({
            message: "invalid Link !!"
        })
        return;
    }

    const content = await ContentModel.find({
        userId: link.userId
    })

    const user =  await UserModel.findOne({
        _id: link.userId
    })

    res.json({
        username: user?.username,
        content: content
    })

});

app.listen(3000);
