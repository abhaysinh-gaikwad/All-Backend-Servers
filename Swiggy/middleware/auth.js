const jwt = require('jsonwebtoken');
const { UserModel } = require('../model/user.model');
const { blacklistModel } = require('../model/blacklist.model')

async function auth(req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const black = await blacklistModel.findOne({token});
        if(black){
            res.status(400).send({msg: "Invalid toke please login again"})
        }else{
            if (token) {
                jwt.verify(token, "abhay", async (err, payload) => {
                    try {
                        if (payload) {
                            const user = await UserModel.findById(payload.userId);
                            if (user) {
                                req.user = user;
                                next();
                            } else {
                                res.status(400).send({ msg: "User not found" });
                            }
                        } else {
                            res.status(400).send({ msg: "Invalid token" });
                        }
                    } catch (err) {
                        res.status(400).send({ msg: "Error while verifying the token" });
                    }
                });
            } else {
                res.status(400).send({ msg: "Please provide a token" });
            }
        }
        
    } catch (err) {
        console.log(err);
        res.status(500).send({ msg: "Error while authorizing the user" });
    }
}

module.exports = {
    auth
}
