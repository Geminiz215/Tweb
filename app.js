const express = require("express");
const app = express();
const port = 3000;
const morgan = require("morgan");
const { validationResult, check } = require("express-validator");
const db = require("./dataBase/db_config.js");
const {
  inputdata,
  inputPesan,
  inputMenu,
  deleteMenu,
  deleteKeranjang,
  update,
} = require("./dataBase/tableLogin");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
//hash password
const bcrypt = require("bcrypt");

var salt = bcrypt.genSaltSync(10);

//set view engine ejs
app.set("view engine", "ejs");
//set folder public
app.use(express.static("public"));
//set input req.body
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
//config flash massage/session
app.use(cookieParser("secret"));
// session
app.use(
  session({
    name: "session",
    secret: "12345678",
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  let nama = req.session.username;
  let identity = req.session.identity;

  res.render("index", {
    title: "Waroeng solo",
    username: nama,
    identity,
  });
});

app.get("/blog", (req, res) => {
  db.connect(function (err) {
    let sql = `SELECT * FROM isiMenu`;
    db.query(sql, function (err, result) {
      res.render("blog", {
        result: result,
        msg: req.flash("msg"),
      });
    });
  });
});

app.get("/blog/:nama", (req, res) => {
  let Menuku = req.params.nama;
  db.connect(function (err) {
    let sql = `SELECT * FROM isiMenu WHERE menu = "${Menuku}"`;
    db.query(sql, function (err, result) {
      res.render("detail", {
        title: "detail order",
        result: result,
      });
    });
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/signup",
  [check("signupemail", "Email Tidak valid!").isEmail()],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(errors.array());
      console.log(errors.array);
    }
    let email = req.body.signupemail;
    let password = req.body.signuppassword;
    let username = req.body.username;
    let Confirmpassword = req.body.confirmPasswordsignup;

    if (password !== Confirmpassword) {
      res.send({ massage: "incorect confirm password" });
    }

    db.connect(function (err) {
      let sql = `SELECT * FROM accounts where email = "${email}"`;
      db.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
          res.send({ message: "Email already usage" });
        } else {
          var hashPassword = bcrypt.hashSync(password, salt);
          inputdata(email, hashPassword, username);
          res.redirect("/login");
        }
      });
    });
  }
);

app.post(
  "/login",
  [check("email", "Email Tidak valid!").isEmail()],
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.send(errors.array());
      console.log(errors.array);
    } else {
      let email = req.body.email;
      let password = req.body.Password;

      db.connect(function (err) {
        let sql = `SELECT * FROM accounts where email = "${email}"`;
        db.query(sql, function (err, result) {
          if (err) throw err;
          if (result.length > 0) {
            result.forEach((accounts) => {
              var cek = bcrypt.compareSync(password, accounts.password);

              if (cek) {
                req.session.Email = accounts.email;
                req.session.username = accounts.username;
                req.session.identity = accounts.identity;
                res.redirect("/");
              } else {
                res.send({ message: "incorect password" });
              }
            });
          } else {
            res.send({ message: "Wrong username/password" });
          }
        });
      });
    }
  }
);

app.get("/Pesan", (req, res) => {
  db.connect(function (err) {
    let sql = `SELECT * FROM isiMenu`;
    db.query(sql, function (err, result) {
      res.render("checkout", {
        result: result,
        title: "FormPemesanan",
      });
    });
  });
});

app.post("/Pesan", (req, res) => {
  let Email = req.body.Email;
  let Jumlah = parseInt(req.body.Jumlah);
  let option = req.body.option;
  let Notes = req.body.Notes;
  let EmailSession = req.session.Email;

  console.log(EmailSession)

  if (Email !== EmailSession) {
    res.send({ message: "wrong email usage" });
  } else {
    db.connect(function (err) {
      let sql = `SELECT * FROM pemesanan where email = "${Email}" and kode = "${option}"`;
      db.query(sql, function (err, result) {
        if (result.length > 0) {
          result.forEach((customer) => {
            let isi = customer.kuantitas;

            update(isi, Jumlah, Email, option, Notes);
            req.flash("msg", "pesanan Berhasil di update");
            res.redirect("/Keranjang");
          });
        } else {
          inputPesan(option, Email, Jumlah, Notes);
          req.flash("msg", "pesanan sudah di keranjang");
          res.redirect("/Keranjang");
        }
      });
    });
  }
});

app.get("/NotFound", (req, res) => {
  res.render("error404", {
    title: "error",
  });
});

app.get("/keranjang", (req, res) => {
  let email = req.session.Email;
  db.connect(function (err) {
    let sql = `SELECT pemesanan.kode, isimenu.menu , pemesanan.email,pemesanan.kuantitas ,isimenu.harga
    FROM isimenu 
    INNER JOIN pemesanan ON pemesanan.kode=isimenu.kode 
    where email = "${email}"`;
    db.query(sql, function (err, result) {
      console.log(result)
      res.render("blog1", {
        result,
        msg: req.flash("msg"),
        email,
      });
    });
  });
});

app.get("/edit", (req, res) => {
  let identity = req.session.identity;

  if (identity !== "user") {
    res.redirect("/NotFound");
  }

  res.render("edit");
});

app.post("/edit", (req, res) => {
  let menu = req.body.menu;
  let harga = req.body.harga;
  let desc = req.body.desc;
  let kode = req.body.kode;

  inputMenu(menu, harga, desc, kode);
  req.flash("msg", "Menu berhasi di tambah");
  res.redirect("/blog");
});

app.get("/edit/delete", (req, res) => {
  res.render("delete");
});

app.post("/edit/delete", (req, res) => {
  let kode = req.body.kode;

  deleteMenu(kode);
  req.flash("msg", "success delete data");
  res.redirect("/blog");
});

app.get("/Logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/keranjang/:kode", (req, res) => {
  let kode = req.params.kode;
  let email = req.session.Email;
  deleteKeranjang(email, kode);
  res.redirect("/keranjang");
});

app.listen(port, () => {
  console.log(`example map listening at localhost http://localhost:${port}`);
});
