const express = require("express");
const app = express();
const port = 2000;
const morgan = require("morgan");
const { validationResult, check } = require("express-validator");
const {
  inputdata,
  inputPesan,
  inputMenu,
  deleteMenu,
  deleteKeranjang,
  update,
  menuku,
} = require("./dataBase/tableLogin");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
//hash password
const bcrypt = require("bcrypt");
const axios = require("axios");

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
  axios({
    method: "GET",
    url: "http://localhost:3000/isimenu/",
  }).then((result) => {
    const data = result.data;
    res.render("blog", {
      result: data,
      msg: req.flash("msg"),
    });
  });
});

app.get("/blog/:nama", (req, res) => {
  let Menuku = req.params.nama;
  axios({
    method: "GET",
    url: `http://localhost:3000/isimenu/cari/${Menuku}`,
  }).then((hasil) => {
    let data = hasil.data;
    res.render("detail", {
      title: "detail order",
      result: data,
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
    } else {
      axios({
        method: "GET",
        url: `http://localhost:3000/accounts/${email}`,
      }).then((hasil) => {
        if (hasil.data.payload !== null) {
          res.send({ message: "Email already usage" });
        } else {
          inputdata(email, password, username);
          if (inputdata() == true) {
            res.redirect("/login");
          } else {
            res.send("gagal SignUp");
          }
        }
      });
    }
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

      axios({
        method: "GET",
        url: `http://localhost:3000/accounts/${email}`,
      }).then((hasil) => {
        if (hasil.data.payload == null) {
          res.send("belum terdaftar");
        }
        var cek = bcrypt.compareSync(password, hasil.data.payload.password);
        if (cek) {
          req.session.Email = hasil.data.payload.email;
          req.session.username = hasil.data.payload.username;
          req.session.identity = hasil.data.payload.identity;
          res.redirect("/");
        } else {
          res.send({ message: "Wrong username/password" });
        }
      });
    }
  }
);

app.get("/Pesan", (req, res) => {
  axios({
    method: "GET",
    url: `http://localhost:3000/isimenu`,
  }).then((hasil) => {
    res.render("checkout", {
      result: hasil.data,
      title: "FormPemesanan",
    });
  });
});

app.post("/Pesan", (req, res) => {
  let Email = req.body.Email;
  let Jumlah = parseInt(req.body.Jumlah);
  let option = req.body.option;
  let Notes = req.body.Notes;
  // let EmailSession = req.session.Email;
  let EmailSession = "Drag@gmail.com";

  if (Email !== EmailSession) {
    res.send({ message: "wrong email usage" });
  } else {
    axios({
      method: "GET",
      url: `http://localhost:3000/pemesanan/s`,
      data: {
        email: Email,
        kode: option,
      },
    }).then((hasil) => {
      if (hasil.data.payload !== null) {
        let isi = hasil.data.payload.kuantitas;
        update(isi, Jumlah, Email, option, Notes);
        req.flash("msg", "pesanan Berhasil di update");
        return res.redirect("/keranjang");
      } else {
        inputPesan(option, Email, Jumlah, Notes)
        req.flash("msg", "pesanan sudah di keranjang");
        return res.redirect("/keranjang");
      }
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
  axios({
    method: "GET",
    url: `http://localhost:3000/isimenu/keranjang/${email}`,
  }).then((hasil) => {
    console.log(hasil)
    res.render("blog1", {
      result: hasil.data,
      msg: req.flash("msg"),
      email,
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

  axios({
    method: "DELETE",
    url: `http://localhost:3000/isimenu/${kode}`,
  }).then((hasil) => {
    console.log(hasil);
    req.flash("msg", "success delete data");
    res.redirect("/blog");
  });
  // deleteMenu(kode);
  // req.flash("msg", "success delete data");
  // res.redirect("/blog");
});

app.get("/Logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.get("/keranjang/:kode", (req, res) => {
  const data = {
    email: req.session.Email,
    kode : req.params.kode
  }
  axios({
    method : "delete",
    url: "http://localhost:3000/pemesanan",
    data : data,
  }).then((hasil) => {
    return res.redirect("/keranjang");
  })
});

app.listen(port, () => {
  console.log(`example map listening at localhost http://localhost:${port}`);
});
