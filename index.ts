import { NextFunction, Request, Response, Application } from "express";
import { uuid } from "uuidv4";
require('dotenv').config()

import {
  PlatformRole,
  ProjectRole,
  PlatformUser,
  Project,
  ProjectUser,
  IProject,
  IPlatformUser,
  IProjectUser
} from "./mongoose";

import {
  UsersGetParams,
  ProjectUserPostBody,
  ProjectUserPostParams,
  ProjectsGetParams,
  ProjectsPostBody,
  UsersPostBody
} from "./expressTypes"


const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8000;
const app: Application = express();

app.use(bodyParser.json());

app.get("/users", (req: Request, res: Response, next: NextFunction) => {
  PlatformUser.find((err, data: Array<IPlatformUser>) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/users/:id", (req: Request<UsersGetParams, {}, {}, {}>, res: Response, next: NextFunction) => {
  PlatformUser.find({ id: req.params.id }, (err, data: Array<IPlatformUser>) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(data[0]);
    }
  });
});

app.post("/users", (req: Request<{},{},UsersPostBody,{}>, res: Response, next: NextFunction) => {
  if (!req.body) {
    res.status(400).send("include request body");
  } else if (!(req.body.username && req.body.email && req.body.password)) {
    res.status(400).send("wrong parameters set");
  } else {
    PlatformUser.find({ email: req.body.email }, (err, data: Array<IPlatformUser>) => {
      if (data.length !== 0) {
        res.status(400).send("user already exists");
      } else {
        const newUser = new PlatformUser({
          id: uuid(),
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          projects: [],
          role: PlatformRole.Member,
        });
        newUser.save((err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.json(doc);
          }
        });
      }
    });
  }
});

app.get("/projects", (req: Request, res: Response, next: NextFunction) => {
  Project.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(data);
    }
  });
});

app.get("/projects/:id", (req: Request<ProjectsGetParams,{},{},{}>, res: Response, next: NextFunction) => {
    Project.find({ id: req.params.id }, (err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(data[0]);
      }
    });
});

app.post("/projects", (req: Request<{},{},ProjectsPostBody,{}>, res: Response, next: NextFunction) => {
  if (!req.body) {
    res.status(400).send("include request body");
  } else if (!(req.body.name && req.body.description)) {
    res.status(400).send("wrong request parameters");
  } else {
    const newProject = new Project({
      id: uuid(),
      name: req.body.name,
      description: req.body.description,
      users: [],
    });
    newProject.save((err: any, data: any) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json(data);
      }
    });
  }
});

app.get("/projects/:id/users", (req: Request, res: Response, next: NextFunction) => {
  if(req.params.id){
    Project.find(({id: req.params.id}), (err: any, data: Array<IProject>) => {
      if(err){
        res.status(500).send(err);
      }
      else{
        res.json(data[0].users);
      }
    })
  }
});

app.get("/projects/:projectid/users/:userid", (req: Request, res: Response, next: NextFunction) => {
  if(req.params.projectid){
    Project.find(({id: req.params.projectid}), (err: any, data: Array<IProject>) => {
      if(err){
        res.status(500).send(err);
      }
      else{
        if(data.length > 0){
          const found = data[0].users.find(elem => elem.id == req.params.userid);
          if(found){
            res.json(found);
          }
          else{
            res.status(404).send("user not found");
          }
        }
        else{
          res.status(404).send("project nout found");
        }
      }
    })
  }
});


app.post("/projects/:id/users", (req: Request<ProjectUserPostParams, {}, ProjectUserPostBody, {}>, res: Response, next: NextFunction) => {
  if(!req.body){
      res.status(400).send("include request body");
  }
  Project.find(({id: req.params.id}), async (err: any, data: Array<IProject>) => {
      if(err){
          res.status(500).send(err);
      }
      else{
        if(data.length > 0){
          if(req.body.userId){
            const newProjectUser = new ProjectUser({
              id: req.body.userId,
              role: ProjectRole.Worker,
              share: 0
            });
            const newArray = data[0].users;
            newArray.push(newProjectUser);
            const temp = await Project.updateOne({ id: req.params.id }, { users: newArray });
            if(temp.nModified > 0){
              res.json(newProjectUser);
            }
            else{
              res.status(500).send("Could not add user");
            }
            }
          else{
            res.status(400).send("wrong body sent");
          }
        }
        else{
          res.status(404).send("project not found");
        }
      }
  });
})


app.listen(PORT, () => {
  console.log("Listening on port: " + PORT);
});
