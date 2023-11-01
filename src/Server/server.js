const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "library",
});

app.post(
  "/signup",
  [
    check("name", "Name field is required").notEmpty(),
    check("email", "Invalid email").isEmail().isLength({ max: 50 }),
    check("password", "Password must be 8-20 characters long")
      .isLength({ min: 8, max: 20 })
      .matches(/\d/)
      .withMessage("Password must contain at least one number"),
    check("instansi", "Instansi field is required").notEmpty(),
    check("tempat_lahir", "Tempat Lahir field is required").notEmpty(),
    check("tgl_lahir", "Tanggal Lahir field is required").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { name, email, password, instansi, tempat_lahir, tgl_lahir } =
      req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }

      const sql =
        "INSERT INTO users (nama, email, password, instansi, tempat_lahir, tgl_lahir) VALUES (?, ?, ?, ?, ?, ?)";
      const values = [
        name,
        email,
        hashedPassword,
        instansi,
        tempat_lahir,
        tgl_lahir,
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.log(err); // Add this line to see the error object in the console
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(422).json({
              error: "Email address already registered",
            });
          } else {
            return res.status(500).json({ error: "Internal server error" });
          }
        }

        return res.status(201).json({ message: "User created successfully" });
      });
    });
  }
);

app.post(
  "/login",
  [
    check("email", "Email length error")
      .isEmail()
      .isLength({ min: 5, max: 30 }),
    check("password", "Password length error").isLength({ min: 8, max: 10 }),
  ],
  (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, data) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json(errors.array());
      } else {
        if (err) {
          return res.json("Error");
        }
        if (data.length > 0) {
          const storedHashedPassword = data[0].password;

          bcrypt.compare(password, storedHashedPassword, (err, result) => {
            if (err) {
              return res.status(500).json({ error: "Internal server error" });
            }

            if (result) {
              // Passwords match, proceed with login
              return res.json(data);
            } else {
              // Passwords don't match, handle unsuccessful login
              return res.json({ message: "Invalid credentials" });
            }
          });
        } else {
          return res.json({ message: "No record existed" });
        }
      }
    });
  }
);

app.get("/data-buku/:barcode", (req, res) => {
  const { barcode } = req.params;

  const sql = "SELECT * FROM data_buku WHERE kode_barcode = ?";

  db.query(sql, [barcode], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Barcode not found" });
    }

    return res.json(data);
  });
});

app.put("/data-buku/:barcode", (req, res) => {
  const { barcode } = req.params;
  const { tersedia, peminjam, tenggat_kembali } = req.body;

  const sql =
    "UPDATE data_buku SET tersedia = ?, peminjam = ?, tenggat_kembali = ? WHERE kode_barcode = ?";

  db.query(
    sql,
    [tersedia, peminjam, tenggat_kembali, barcode],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Barcode not found" });
      }

      return res.json({ message: "Status and peminjam updated successfully" });
    }
  );
});

app.post(
  "/add-transaksi",
  [
    check("id_user", "user id field is required").notEmpty(),
    check("kode_barcode", "Invalid barcode").notEmpty(),
    check("tanggal_pinjam", "Invalid pinjam date").isISO8601(),
    check("tanggal_kembali", "Invalid kembali date").isISO8601(),
    check("status", "Status field is required").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { id_user, kode_barcode, tanggal_pinjam, tanggal_kembali, status } =
      req.body;

    const sql =
      "INSERT INTO transaksi (id_user, kode_barcode, tanggal_pinjam, tanggal_kembali, status) VALUES ( ?, ?, ?, ?, ?)";
    const values = [
      id_user,
      kode_barcode,
      tanggal_pinjam,
      tanggal_kembali,
      status,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.log(err); // Add this line to see the error object in the console
        return res.status(500).json({ error: "Internal server error" });
      }

      const transactionId = result.insertId;

      return res
        .status(201)
        .json({ message: "Transaction added successfully", transactionId });
    });
  }
);

app.get("/fetch-transaction/:transactionID", (req, res) => {
  const { transactionID } = req.params;

  const sql = "SELECT * FROM transaksi WHERE id_transaksi = ?";
  db.query(sql, [transactionID], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.json(data[0]);
  });
});

app.post(
  "/add-pengembalian",
  [
    check("id_user", "user id field is required").notEmpty(),
    check("id_transaksi", "transaksi id field is required").notEmpty(),
    check("kode_barcode", "Invalid barcode").notEmpty(),
    check("tanggal_pinjam", "Invalid pinjam date").isISO8601(),
    check(
      "deadline_pengembalian",
      "Invalid tanggal deadline pengembalian"
    ).isISO8601(),
    check("tanggal_pengembalian", "Invalid kembali date").isISO8601(),
    check("denda", "denda required").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      id_user,
      id_transaksi,
      kode_barcode,
      tanggal_pinjam,
      deadline_pengembalian,
      tanggal_pengembalian,
      denda,
    } = req.body;

    const sql =
      "INSERT INTO pengembalian (id_user, id_transaksi, kode_barcode, tanggal_pinjam, deadline_pengembalian, tanggal_pengembalian, denda) VALUES ( ?, ?, ?, ?, ?, ?, ?)";
    const values = [
      id_user,
      id_transaksi,
      kode_barcode,
      tanggal_pinjam,
      deadline_pengembalian,
      tanggal_pengembalian,
      denda,
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.log(err); // Add this line to see the error object in the console
        return res.status(500).json({ error: "Internal server error" });
      }

      return res
        .status(201)
        .json({ message: "Transaksi Pengembalian added successfully" });
    });
  }
);

app.listen(8081, () => {
  console.log("listening");
});
