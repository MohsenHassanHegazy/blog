import express, { request } from "express";
import { ValidationError, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import socket from "../socket";
import User from "../models/user";
import Post from "../models/post";
import Comment from "../models/comment";

const getdashBoard = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  if (!req.session.user.isadmin) {
    return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  }
  return res.render("../views/dashbord/dashBoard", {
    errors: null,
  });
};

const getbanUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (!req.session.user.isadmin) {
    return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  }
  const userId = req.params.userId;
  return res
    .status(200)
    .render("../views/dashbord/banUser", { userId: userId, errors: null });
};

const banUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (!req.session.user.isadmin) {
    return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  }
  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json("user not found");
  }
  if (user.isadmin) {
    return res.send("cant ban admins");
  }
  const dat = req.body.dat;
  user.banDate = new Date(dat);
  user.save();
  return res.status(200).redirect("/");
};

const unBanUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (!req.session.user.isadmin) {
    return res.json("not authorized!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  }

  const userId = req.params.userId;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json("user not found");
  }

  user.banDate = new Date(Date.now());
  user.save();
  return res.status(200).redirect("/");
};

const ex = {
  getdashBoard: getdashBoard,
  banUser: banUser,
  unBanUser: unBanUser,
  getbanUser: getbanUser,
};

export default ex;
