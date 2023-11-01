import React, { useRef, useEffect, useState } from "react";
import Quagga from "quagga";
import ScanningAnimation from "../components/ScanAnimation";
import axios from "axios";
import { Table, Button, Modal } from "flowbite-react";
import PopUp from "../components/PopUp";
import { MdErrorOutline } from "react-icons/md";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";

function ScanPagePengembalian() {
  const videoRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [scannerActive, setScannerActive] = useState(false);
  const [bukuPinjaman, setBukuPinjaman] = useState({ books: [] });
  const [scannedBooks, setScannedBooks] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bukuKurang, setbukuKurang] = useState(false);
  const [isShowed, setIsShowed] = useState(false);
  const [unscannedBooks, setUnscannedBooks] = useState([]);
  const [sudahKembali, setSudahKembali] = useState(false);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => console.error("Could not access camera: ", error));
    }

    fetchBookData();
    const storedScannedCodes = localStorage.getItem("scannedCodes");
    if (storedScannedCodes) {
      setScannedCodes(JSON.parse(storedScannedCodes));
    }

    activateScanner();

    localStorage.removeItem("firstRender");
    localStorage.removeItem("scannedBooks");
    localStorage.removeItem("scannedCodes");
  }, []);

  const activateScanner = () => {
    const onDetected = (result) => {
      const code = result.codeResult.code;
      if (!scannedCodes.find((item) => item.kode_barcode === code)) {
        const scannedBook = bukuPinjaman.books.find(
          (book) => book.kode_barcode === code
        );
        if (scannedBook) {
          const updatedScannedCodes = [...scannedCodes, scannedBook];
          setScannedCodes(updatedScannedCodes);
          localStorage.setItem(
            "scannedCodes",
            JSON.stringify(updatedScannedCodes)
          );
          console.log(`scannedBooks = ${scannedBook}`);
          setScannedBooks([...scannedBooks, scannedBook]);
        }
      }
    };

    setScannerActive(true);
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current,
        },
        decoder: {
          readers: ["code_128_reader"],
          patchSize: "small",
          worker: {
            useWorker: true,
          },
        },
      },
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.onDetected(onDetected);
        Quagga.start();
      }
    );
  };

  const deactivateScanner = () => {
    setScannerActive(false);
    Quagga.stop();
  };

  useEffect(() => {
    if (scannerActive) {
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        if (!scannedCodes.find((item) => item.kode_barcode === code)) {
          console.log(result);
          const scannedBook = bukuPinjaman.books.find(
            (book) => book.kode_barcode === code
          );
          console.log(code);
          if (scannedBook && !scannedBooks.includes(scannedBook)) {
            const updatedScannedCodes = [...scannedCodes, scannedBook];
            setScannedCodes(updatedScannedCodes);
            localStorage.setItem(
              "scannedCodes",
              JSON.stringify(updatedScannedCodes)
            );

            const updatedScannedBooks = [...scannedBooks, scannedBook];
            setScannedBooks(updatedScannedBooks);
          }
        }
      });
    }
  }, [scannerActive, scannedCodes, bukuPinjaman.books, scannedBooks]);

  useEffect(() => {
    localStorage.setItem("scannedCodes", JSON.stringify(scannedCodes));
  }, [scannedCodes]);

  useEffect(() => {
    const scannedBarcodes = scannedBooks.map((book) => book.kode_barcode);
    const updatedUnscannedBooks = bukuPinjaman.books.filter(
      (book) => !scannedBarcodes.includes(book.kode_barcode)
    );

    setUnscannedBooks(updatedUnscannedBooks);
  }, [scannedBooks, bukuPinjaman.books]);

  useEffect(() => {
    localStorage.setItem("unscannedBooks", JSON.stringify(unscannedBooks));
  }, [unscannedBooks]);

  useEffect(() => {
    localStorage.setItem("scannedBooks", JSON.stringify(scannedBooks));
  }, [scannedBooks]);

  const fetchBookData = () => {
    const dataTransaksi = localStorage.getItem("dataTransaksi");
    if (dataTransaksi) {
      setBukuPinjaman(JSON.parse(dataTransaksi));
    }

    if (JSON.parse(dataTransaksi).status === "Selesai") {
      setSudahKembali(true);
    }
    console.log(JSON.parse(dataTransaksi).status);
  };

  const storedData = localStorage.getItem("userData");
  const userData = JSON.parse(storedData);

  async function addTransaksiPengembalian() {
    try {
      setbukuKurang(false);
      const currentDate = new Date();

      let barcodes = "";
      scannedBooks.forEach((book) => {
        if (barcodes === "") {
          barcodes = `${book.kode_barcode}`;
        } else {
          barcodes += `,${book.kode_barcode}`;
        }
      });

      const denda = localStorage.getItem("denda");

      const newPengembalianTransaction = {
        id_user: userData.id,
        id_transaksi: parseInt(bukuPinjaman.id),
        kode_barcode: barcodes,
        tanggal_pinjam: bukuPinjaman.tanggal_pinjam,
        deadline_pengembalian: bukuPinjaman.deadline_pengembalian,
        tanggal_pengembalian: currentDate,
        denda: denda,
      };
      console.log(newPengembalianTransaction);
      if (scannedBooks.length === bukuPinjaman.books.length) {
        const response = await axios.put(
          `https://server.libraryselfservice.site/pengembalian/${parseInt(
            bukuPinjaman.id
          )}`,
          { denda: false }
        );
        localStorage.removeItem("scannedBooks");
        localStorage.removeItem("dataTransaksi");
        localStorage.removeItem("scannedCodes");
        console.log("Transaction added successfully:", response.data);
        scannedBooks.forEach(async (book) => {
          const response = await axios.put(
            `https://server.libraryselfservice.site/data-buku/${book.kode_barcode}`,
            { tersedia: true }
          );
          console.log(response);
        });
        setIsSuccess(true);

        sendEmail({
          userName: userData.nama,
          id: bukuPinjaman.id,
          userEmail: userData.email,
        });
      } else {
        console.log("Buku Kurang ");
        setbukuKurang(true);
        setIsShowed(true);
      }
    } catch (error) {
      console.error("Error adding transaction:", error.response.data);
    }
  }

  const handleScanKembali = () => {
    setIsShowed(false);
  };

  const sendEmail = ({ userName, id, tenggatKembali, userEmail }) => {
    emailjs.init("liKPdZ4kUvRtaLSDM");
    const serviceID = "service_l5f0wig";
    const templateID = "template_acdys8u";
    const userID = "liKPdZ4kUvRtaLSDM";

    const templateParams = {
      user_name: userName,
      id_transaksi: id,
      userEmail: userEmail,
    };

    emailjs
      .send(serviceID, templateID, templateParams, userID, {
        to_email: userEmail,
      })
      .then((response) => {
        console.log("Email sent successfully!", response);
        console.log(templateParams);
      })
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  };

  return (
    <div className="my-14 w-full">
      {sudahKembali && (
        <PopUp
          btnQty="1"
          primaryBtn="Kembali"
          primaryPath="/pengembalian-id"
          contentText="Transaksi sudah dikembalikan"
          icon="gagal"
        />
      )}

      {isSuccess && (
        <PopUp
          contentText="Pengembalian Buku Berhasil"
          primaryBtn="Kembali ke Home"
          primaryPath="/home"
          btnQty="1"
          icon="berhasil"
        />
      )}

      {bukuKurang && (
        <div>
          <Modal size="xl" show={isShowed === true ? true : false}>
            <Modal.Body className="p-14">
              <div className="flex justify-end"></div>
              <div className="text-center">
                <MdErrorOutline className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  <p>Buku yang dikembalikan kurang</p>
                </h3>
                <div>
                  <div className="flex justify-center gap-4">
                    <Link to={"/pembayaran-denda"}>
                      <Button>Bayar Denda</Button>
                    </Link>
                    <Button color="gray" onClick={handleScanKembali}>
                      Scan Kembali
                    </Button>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      )}
      <h1 className="text-3xl font-bold">Layanan Pengembalian Buku Mandiri</h1>

      <div className="grid grid-cols-3 gap-4 mx-10">
        <div>
          <div className="my-10 relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full rounded-md"
            />
            <div className="scan-animation-container w-full h-full">
              <ScanningAnimation />
            </div>
          </div>
          <div className="my-10 text-center">
            <h3 className="text-2xl font-bold mb-5">
              Silahkan Scan Barcode Pada Buku
            </h3>
          </div>
        </div>
        <div className="col-span-2 my-10">
          <Table hoverable={true} className="table-fixed min-w-full">
            <Table.Head>
              <Table.HeadCell>No.</Table.HeadCell>
              <Table.HeadCell>Pengarang</Table.HeadCell>
              <Table.HeadCell>Judul</Table.HeadCell>
              <Table.HeadCell>Penerbit</Table.HeadCell>
              <Table.HeadCell>Tahun Terbit</Table.HeadCell>
              <Table.HeadCell>Kode Buku</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {bukuPinjaman.books.map((book, index) => (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={book.kode_barcode}
                >
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {index + 1}
                  </Table.Cell>
                  <Table.Cell>{book.pengarang}</Table.Cell>
                  <Table.Cell>{book.judul}</Table.Cell>
                  <Table.Cell>{book.penerbit}</Table.Cell>
                  <Table.Cell>{book.tahun_terbit}</Table.Cell>
                  <Table.Cell>{book.kode_barcode}</Table.Cell>
                  <Table.Cell>
                    {scannedCodes.find(
                      (item) => item.kode_barcode === book.kode_barcode
                    )
                      ? "Scanned"
                      : ""}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
      <div className="justify-center flex">
        <Button onClick={addTransaksiPengembalian}>Konfirmasi</Button>
      </div>
    </div>
  );
}

export default ScanPagePengembalian;
