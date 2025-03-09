import express from 'express';
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from './db';
import { userMiddleware } from './middleware';
import { random } from './utils';
import cors from 'cors';
const bcrypt = require('bcrypt');
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

 
app.post("/api/v1/signup", async (req,res) => {
    //zod
    const username = req.body.username;
    const password = req.body.password;

    try{
        await UserModel.create({
            username: username,
            password: password
        })

        res.json({
            message: "User signed Up"
        })
    } catch(e){
        res.status(411).json({
            message:"User already exist"
        })
    }
})

app.post("/api/v1/signin", async (req,res) => {
    
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
        username,
        password
    })
    if(existingUser){
        const token = jwt.sign({
            ID: existingUser._id
        }, process.env.JWTPASS as string)
        console.log("Sign-In: Generated token for userId:", existingUser._id);

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

})

app.post("/api/v1/content", userMiddleware, async (req, res) => {
    const link = req.body.link;
    const type = req.body.type;
    await ContentModel.create({
        link,
        type,
        title: req.body.title,
        userId: req.userId,
        tags: [],
    })
    res.json({
        message: "Content added"
    })
    
})

app.get("/api/v1/content", userMiddleware, async (req, res) => {
    
    const userId = req.userId;
    const type = req.query.type; 

    const filter: any = { userId: userId };
    if (type) {
        filter.type = type; 
    }

    const content = await ContentModel.find(filter).populate("userId", "username");
    res.json({
        content,
    });
});

// app.get("/api/v1/content", userMiddleware, async (req, res) => {
    
//     const userId = req.userId;

//     const content = await ContentModel.find({
//         userId: userId
//         }).populate("userId", "username")
//         res.json({
//         content
//     })
// })


app.delete("/api/v1/content", userMiddleware, async (req, res) => {
    const contentId = req.body.contentid; 

    try {
        await ContentModel.deleteMany({
            _id: contentId,
            //@ts-ignore
            userId: req.userId 
        });
        res.json({ msg: "Content deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete content" });
    }
});

app.post("/api/v1/brain/share", userMiddleware, async(req,res) => {
    const share = req.body.share;
    if(share){
        const existingLink = await LinkModel.findOne({
            //@ts-ignore
            userId: req.userId
        });
        if(existingLink){
            res.json({
                hash:existingLink.hash
            })
            return;
        }
        const hash = random(10);
        await LinkModel.create({
            //@ts-ignore
            userId: req.userId,
            hash:hash
        })

        res.json({
            hash
        })
    }else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId: req.userId,
        })
        res.json({
            message: 'Removed link'
        })
    }

})

app.get("/api/v1/brai n/:shareLink", async (req,res) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({
        hash
    })
    if(!link){
        res.status(411).json({
            message: "Sorry incorrect input"
        })
        return
    }

    const content = await ContentModel.find({
        //@ts-ignore
        userId: link.userId
    })

    const user = await UserModel.findOne({
        userId: link.userId
    })

    if(!user){
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        })
        return;
    }

    res.json({
        username : user.username,
        content : content 
    })
})


app.listen(3000);