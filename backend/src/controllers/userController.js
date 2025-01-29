import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";

const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)


        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Please provide all required fields",
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(httpStatus.CREATED).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: `Something went wrong: ${error.message}`,
    });
  }


};

const getUserHistory = async(req, res) => {
  // Implement logic to get user's call history
  const token = req.query
  try {
    const user = await User.findOne({token: token});
    const meetings = await Meeting.find.find({user_id: user.username})
    res.json(meetings)
  } catch (error) {
    res.json({message: `something went wrong ${error.message}`}); 
  }
}

const addToHistory = async (req, res) => {
  const {token, meeting_Code }= req.body;
  try {
    
    const user = await User.findOne({token: token});
    const newMeeting = new Meeting({user_id: user.username, meetingCode: meeting_Code}); 

    await newMeeting.save();
    resStatus(httpStatus.CREATED).json({message: "Meeting added to history"}) 
  } catch (error) {
     res.json({message: `Something went wrong ${error.message}`})
  }
}

export { login, register,getUserHistory,addToHistory };
