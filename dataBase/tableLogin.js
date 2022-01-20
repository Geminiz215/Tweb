const axios = require("axios");

const inputdata = (email, password, username) => {
  axios({
    method: "POST",
    url: `http://localhost:3000/accounts/`,
    data: {
      email: email,
      password: password,
      username: username,
    },
  }).then((hasil) => {
    if (hasil.data == "ok"){
      return true
    }
  });
  if (axios){
    return true
  }
};

const inputPesan = (option, Email, Jumlah, Notes) => {
  axios({
    method : "POST",
    url: "http://localhost:3000/pemesanan/",
    data : {
      kode : option,
      email: Email,
      kuantitas: Jumlah,
      notes: Notes
    }
  }).then((hasil) => {
    return true
  })
};

const inputMenu = (menu, harga, desc, kode) => {
  db.connect(function (err) {
    // if (err) throw err;

    let sql = `INSERT INTO isimenu (menu, harga, description, kode) VALUES ("${menu}","${harga}","${desc}","${kode}")`;

    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      console.log("1 record inserted");
    });
  });
};

const deleteMenu = (kode) => {
  db.connect(function (err) {
    // if (err) throw err;

    let sql = `DELETE from isimenu WHERE kode = "${kode}"`;

    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      console.log("Berhasil di hapus");
    });
  });
};

const deleteKeranjang = (email, kode) => {
  db.connect(function (err) {
    // if (err) throw err;

    let sql = `DELETE from pemesanan WHERE email = "${email}" AND kode = "${kode}"`;

    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      console.log("data keranjang Berhasil di hapus");
    });
  });
};

const update = (isi, Jumlah, Email, option, Notes) => {
  isi += Jumlah;

  const data = {
    kuantitas : isi,
    email : Email,
    kode : option,
    notes : Notes
  }


  axios({
    method: "PUT",
    url: `http://localhost:3000/pemesanan/`,
    data : data,
  }).then((hasil) => {
    console.log(hasil)
  })

  return true
};

const isimenu = `http://localhost:3000/isimenu/`;
function menuku() {
  fetch(isimenu)
    .then((response) => response.json())
    .then((resJson) => {
      console.log(resJson);
    });
  return resJson;
}
module.exports = {
  inputdata,
  inputPesan,
  inputMenu,
  deleteMenu,
  deleteKeranjang,
  update,
  menuku,
};
