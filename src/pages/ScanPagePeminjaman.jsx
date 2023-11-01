import React, { useRef, useEffect, useState } from "react";
import Quagga from "quagga";
import ScanningAnimation from "../components/ScanAnimation";
import axios from "axios";
import { Table, Button } from "flowbite-react";
import { Link } from "react-router-dom";
import PopUp from "../components/PopUp";

function ScanPagePeminjaman() {
  const videoRef = useRef(null);
  const [scannedCodes, setScannedCodes] = useState([]);
  const [bukuPinjamData, setBukuPinjamData] = useState([]);
  const [sudahPinjam, setSudahPinjam] = useState();
  const [isRemovingBook, setRemovingBook] = useState(false);

  const onDetectedRef = useRef(null);

  useEffect(() => {
    const initializeScanner = () => {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: videoRef.current,
          },
          decoder: {
            readers: ["ean_reader", "upc_reader", "code_128_reader"],
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
          Quagga.start();
        }
      );
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            initializeScanner();
          }
        })
        .catch((error) => console.error("Could not access camera: ", error));
    }

    localStorage.removeItem("firstRender");

    return () => {
      Quagga.stop();
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    };
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem("bukuPinjamData");
    if (storedData) {
      setBukuPinjamData(JSON.parse(storedData));
    }
  }, []);

  const fetchTransaksi = async () => {
    const storedData = localStorage.getItem("userData");
    const userData = JSON.parse(storedData);

    const response = await axios.get(
      "https://server.libraryselfservice.site/transaction"
    );
    const transactions = response.data;

    const transactionFiltered = transactions.filter(
      (data) => data.id_user === userData.id && data.status === "Dipinjam"
    );

    if (transactionFiltered.length !== 0) {
      setSudahPinjam(true);
    } else {
      setSudahPinjam(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, []);

  useEffect(() => {
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
        Quagga.start();
      }
    );

    const onDetected = (result) => {
      const code = result.codeResult.code;
      if (!isRemovingBook && !scannedCodes.find((item) => item.code === code)) {
        fetchBookData(code);
      }
    };

    onDetectedRef.current = onDetected;
    Quagga.onDetected(onDetectedRef.current);

    return () => {
      Quagga.offDetected(onDetectedRef.current);
      Quagga.stop();
    };
  }, [isRemovingBook, scannedCodes]);

  const fetchBookData = (code) => {
    axios
      .get(`https://server.libraryselfservice.site/data-buku/${code}`)
      .then((response) => {
        const bookData = response.data[0];
        if (bookData) {
          setScannedCodes((prevCodes) => [
            ...prevCodes,
            {
              code: code,
              pengarang: bookData.pengarang,
              judul: bookData.judul,
              penerbit: bookData.penerbit,
              tahun_terbit: bookData.tahun_terbit,
            },
          ]);

          const bukuData = {
            code: code,
            pengarang: bookData.pengarang,
            judul: bookData.judul,
            penerbit: bookData.penerbit,
            tahun_terbit: bookData.tahun_terbit,
          };

          const updatedBukuPinjamData = [...bukuPinjamData, bukuData];

          setBukuPinjamData(updatedBukuPinjamData);
          localStorage.setItem(
            "bukuPinjamData",
            JSON.stringify(updatedBukuPinjamData)
          );
        }
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const removeBook = (code) => {
    setBukuPinjamData((prevBukuPinjamData) =>
      prevBukuPinjamData.filter((buku) => buku.code !== code)
    );

    setScannedCodes((prevScannedCodes) =>
      prevScannedCodes.filter((item) => item.code !== code)
    );

    const updatedBukuPinjamData = bukuPinjamData.filter(
      (buku) => buku.code !== code
    );
    localStorage.setItem(
      "bukuPinjamData",
      JSON.stringify(updatedBukuPinjamData)
    );

    setRemovingBook(true);
    setTimeout(() => {
      setRemovingBook(false);
    }, 500);
  };

  return (
    <div className="my-14 w-full">
      <h1 className="text-3xl font-bold">Layanan Peminjaman Buku Mandiri</h1>
      <div className="grid grid-cols-3 gap-4 mx-10">
        <div>
          {sudahPinjam && (
            <PopUp
              contentText="Tidak dapat meminjam buku kembali"
              primaryBtn="Home"
              primaryPath="/home"
              btnQty="1"
              icon="gagal"
            />
          )}

          {bukuPinjamData.length > 3 ? (
            <PopUp
              contentText="Buku yang dipinjam tidak boleh lebih dari 3"
              primaryBtn="Kurangi Buku"
              primaryPath="/scan-pinjam"
              btnQty="0"
              closeBtn={true}
            />
          ) : (
            ""
          )}
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
            <Table.Head className="border border-gray-700 rounded-lg">
              <Table.HeadCell className="w-1/12">No.</Table.HeadCell>
              <Table.HeadCell className="w-2/12">Pengarang</Table.HeadCell>
              <Table.HeadCell className="w-2/12">Judul</Table.HeadCell>
              <Table.HeadCell className="w-2/12">Penerbit</Table.HeadCell>
              <Table.HeadCell className="w-1/12">Tahun Terbit</Table.HeadCell>
              <Table.HeadCell className="w-2/12">Kode Buku</Table.HeadCell>
              <Table.HeadCell className="w-2/12">Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y border border-gray-700">
              {bukuPinjamData.length > 0 ? (
                bukuPinjamData.map((code, index) => (
                  <Table.Row
                    className="bg-white dark:bg-gray-800 border border-gray-700"
                    key={code.code}
                  >
                    <Table.Cell className="font-medium text-gray-900 dark:text-white w-1/12">
                      {index + 1}
                    </Table.Cell>
                    <Table.Cell>{code.pengarang}</Table.Cell>
                    <Table.Cell>{code.judul}</Table.Cell>
                    <Table.Cell>{code.penerbit}</Table.Cell>
                    <Table.Cell className="w-1/12">
                      {code.tahun_terbit}
                    </Table.Cell>
                    <Table.Cell>{code.code}</Table.Cell>
                    <Table.Cell className="w-2/12">
                      <Button
                        onClick={() => removeBook(code.code)}
                        color={"failure"}
                      >
                        Remove
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  key={"no-data"}
                >
                  <Table.Cell
                    colSpan={7}
                    className="whitespace-nowrap font-medium text-gray-500 dark:text-white text-center"
                  >
                    Belum ada buku yang di-Scan
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
      <div className="justify-center flex">
        <Link
          to={
            bukuPinjamData.length > 3
              ? "/scan-pinjam"
              : "/konfirmasi-peminjaman"
          }
        >
          <Button
            className="w-fit"
            disabled={bukuPinjamData.length > 3 ? true : false}
          >
            Konfirmasi
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ScanPagePeminjaman;
