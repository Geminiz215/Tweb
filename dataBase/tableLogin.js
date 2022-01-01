const db = require("./db_config");

const inputdata = (email, password, username) => {
  db.connect(function (err) {
    // if (err) throw err;

    let sql = `INSERT INTO accounts (email, password, username) VALUES ("${email}","${password}","${username}")`;

    db.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
};

const inputPesan = (option, Email, Jumlah, Notes) => {
  db.connect(function (err) {
    // if (err) throw err;

    let sql = `INSERT INTO pemesanan (kode, email, kuantitas, notes) VALUES ("${option}","${Email}","${Jumlah}","${Notes}")`;

    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      console.log("1 record inserted");
    });
  });
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
}

const deleteKeranjang = (email,kode) => {
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
}

const update = (isi , Jumlah , Email , option , Notes) => {

  isi += Jumlah
  db.connect(function (err) {
    // if (err) throw err;

    let sql = `UPDATE pemesanan set kuantitas = ${isi} , notes = "${Notes}" where email = "${Email}" and kode = "${option}" `;

    db.query(sql, function (err, result) {
      if (err) {
        throw err;
      }
      console.log("data keranjang Berhasil id update");
    });
  });
}
module.exports = { inputdata, inputPesan, inputMenu, deleteMenu, deleteKeranjang, update };
