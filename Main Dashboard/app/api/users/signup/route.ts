import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendMail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, email, password } = reqBody;
    console.log(reqBody);

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Please fill all fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    // console.log("User created");

    // await sendMail({ email, emailType: 'VERIFY', userId: savedUser._id });

    return NextResponse.json({ message: "User created", status: 201, user: savedUser, success: true });

  } catch (error:any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
