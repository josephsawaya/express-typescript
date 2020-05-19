import { Document } from "mongoose";
import { Mongoose, Schema } from "mongoose";


const mongoose: Mongoose = require("mongoose");

const mongo_key = process.env.MONGO_KEY;
if(mongo_key){
  mongoose.connect(
    mongo_key,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );
}

mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("mongo connection open");
});


export interface IPlatformUser extends Document {
    id: string;
    username: string;
    email: string;
    password: string;
    projects: Array<string>;
    role: PlatformRole;
  }
  
export interface IProjectUser extends Document {
    id: string;
    role: ProjectRole;
    share: number;
  }
  
export interface IProject extends Document {
    id: string;
    name: string;
    description: string;
    users: Array<IProjectUser>;
  }

export enum PlatformRole {
    Member,
    Director,
    Contractor,
    Sponsor
}

export enum ProjectRole {
    Worker,
    Manager, 
    Investor
}


const PlatformUserSchema: Schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    projects: {
        type: [String],
        required: true
    },
    role: {
        type: String,
        enum: ["Member", "Director", "Contractor", "Sponsor"],
        required: true
    },
});

const ProjectUserSchema = new mongoose.Schema({
  id: String,
  role: {
    type: String,
    enum: ["Worker", "Manager", "Investor"],
    default: "Worker",
  },
  share: Number,
});

const ProjectSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  users: [ProjectUserSchema],
});

export const PlatformUser = mongoose.model<IPlatformUser>("User", PlatformUserSchema);
export const Project = mongoose.model<IProject>("Project", ProjectSchema);
export const ProjectUser = mongoose.model<IProjectUser>("ProjectUser", ProjectSchema);