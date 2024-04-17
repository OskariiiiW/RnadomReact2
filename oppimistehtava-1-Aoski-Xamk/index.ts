import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";

const app : express.Application = express();
const portti : number = Number(process.env.PORT) || 3101;
const prisma : PrismaClient = new PrismaClient();

app.set("view engine", "ejs");

app.use(express.static(path.resolve(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.post("/", async (req : express.Request, res : express.Response) => {

    let kunnat = await prisma.kunta.findMany({
        where: {
          kunta: {
            startsWith: req.body.teksti
          }
        },
      });
    res.render( "index", {kunnat : kunnat});

});

app.get("/", async (req : express.Request, res : express.Response) => {

    res.render("index", {kunnat : await prisma.kunta.findMany()});

});

app.listen(portti, () => {

});