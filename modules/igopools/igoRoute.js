const express = require("express");
const igoCtr = require("./igoController");

const igoRoute = express.Router();

igoRoute.post("/createIGO", igoCtr.igoCreate);
igoRoute.get("/upcoming-list", igoCtr.igoUpCommingList);
igoRoute.get("/liveIGO", igoCtr.liveIGO);
igoRoute.get("/liveCompleted-list", igoCtr.igoLiveCompletedList);
igoRoute.get("/completed-list", igoCtr.igoCompletedList);
igoRoute.get("/featured-list", igoCtr.igoFeaturedList);
igoRoute.get("/get-igo/:id", igoCtr.getSingleIGO);
igoRoute.post("/igo-edit", igoCtr.editIgo);
 //toDo: This code commented for test purpose
// igoRoute.get("/set-igo-cron", igoCtr.scheduleTodayIgoCron);

//toDo:List all IGO - Just for testing.
igoRoute.get("/listAllIGO", igoCtr.listAllIGOs);
    
module.exports = igoRoute;
