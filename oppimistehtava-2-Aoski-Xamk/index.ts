import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import fs from "fs/promises";

const app : express.Application = express();
const portti : number = Number(process.env.PORT) || 3102;
const prisma : PrismaClient = new PrismaClient();
const uploadKasittelija = multer({dest : path.resolve(__dirname, "tmp"), fileFilter : (req, file, callback) => {

    if (["json"].includes(file.mimetype.split("/")[1])) {
        callback(null, true);

    } else {
        callback(new Error()); 
    }

}}).single("tiedosto");

app.set("view engine", "ejs");

app.use(express.static(path.resolve(__dirname, "public")));

app.post("/upload", async (req : express.Request, res : express.Response) => {

    uploadKasittelija(req, res, async (err : any) => {
        
        if (err) {
            res.render("upload", { virhe : "Virheellinen tiedostomuoto. Käytä ainoastaan json-tiedostoja", teksti : req.body.teksti});

        } else {

            if (req.file) {

                /* 
                await prisma.askeldata.deleteMany({
                    where: {
                        vvvv: 2022
                    }
                });*/

                let jsonTieto = JSON.parse(await (await fs.readFile(path.resolve(__dirname, "tmp", String(req.file.filename)))).toString());

                for (var i = 0; i < jsonTieto.length; i++) {

                    await prisma.askeldata.create({
                        
                        data : {
                            pp : Number(jsonTieto[i].pp),
                            kk : Number(jsonTieto[i].kk),
                            vvvv : Number(jsonTieto[i].vvvv),
                            askeleet : Number(jsonTieto[i].askeleet)
                        }
                    });   
                };
            }
            res.redirect("/");
        }
    });
});

app.get("/upload", async (req : express.Request, res : express.Response) => {

    res.render("upload", { virhe : "", teksti : ""});

});

app.get("/", async (req : express.Request, res : express.Response) => {

    res.render("index", {tiedot : await prisma.askeldata.findMany({
        orderBy: [
            {
                vvvv: 'desc',
            },
            {
                kk: 'desc',
            },
            {
                pp: 'desc',
            },
        ]
    })});

});

app.listen(portti, () => {

});