import React, { useEffect, useState } from "react";
import Heading from "../components/Heading";
import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import axios from "axios";
import BuktiPeminjamanPDF from "../components/BuktiPeminjamanPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import LogOutButton from "../components/LogOutButton";

function BuktiPeminjaman() {
  const [idTransaksi, setIdTransaksi] = useState(null);
  const [waktuPeminjaman, setWaktuPeminjaman] = useState();
  const [deadlinePengembalian, setdeadlinePengembalian] = useState();
  const [books, setBooks] = useState([]);

  const fetchTransaction = async (idTransaksi) => {
    const response = await axios.get(
      `https://server.libraryselfservice.site/fetch-transaction/${idTransaksi}`
    );

    const utcDate = new Date(response.data.tanggal_pinjam);
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    console.log(`Data Transaksi : ${response.data.kode_barcode}`);
    const localDate = new Intl.DateTimeFormat("id-ID", options).format(utcDate);
    setWaktuPeminjaman(localDate);

    setdeadlinePengembalian(
      new Date(response.data.tenggat_kembali).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );

    const barcodePromises = response.data.kode_barcode
      .split(",")
      .map(async (barcode) => {
        const bookResponse = await axios.get(
          `https://server.libraryselfservice.site/data-buku/${barcode}`
        );
        if (bookResponse && bookResponse.data && bookResponse.data.length > 0) {
          return bookResponse.data[0];
        }
        return null;
      });

    const bookData = await Promise.all(barcodePromises);
    setBooks(bookData);
  };

  useEffect(() => {
    const storedIdTransaksi = localStorage.getItem("idTransaksi");

    const fetchData = async () => {
      if (storedIdTransaksi) {
        setIdTransaksi(storedIdTransaksi);
        await fetchTransaction(storedIdTransaksi);
      } else {
        console.log("id Null");
      }
    };

    fetchData();
  }, []);

  const handleRemoveId = () => {
    localStorage.removeItem("idTransaksi");
  };

  return (
    <div className="flex justify-center flex-col items-center w-full my-20">
      <Heading title={"Bukti Peminjaman Buku"} />

      <h1 className="text-4xl font-bold text-center">{idTransaksi}</h1>

      <div className="w-2/5 my-5 text-center">
        <h3 className="mb-10 text-xl">Waktu Peminjaman :</h3>

        <div className="flex justify-around text-xl">
          <b>
            <p>{waktuPeminjaman}</p>
          </b>
          <p>Sampai</p>
          <b>
            <p>{deadlinePengembalian}</p>
          </b>
        </div>
        <p className="font-bold mt-16 text-xl">
          Silahkan cek email anda untuk melihat bukti transaksi peminjaman buku
        </p>
      </div>

      <div className="grid grid-cols-2 gap-14 my-10">
        <PDFDownloadLink
          document={
            <BuktiPeminjamanPDF
              idTransaksi={idTransaksi}
              waktuPeminjaman={waktuPeminjaman}
              deadlinePengembalian={deadlinePengembalian}
              buku={books}
            />
          }
          fileName="Bukti Peminjaman"
        >
          {({ loading }) =>
            loading ? (
              <Button>Loading Document...</Button>
            ) : (
              <Button>Download</Button>
            )
          }
        </PDFDownloadLink>

        <LogOutButton onClick={handleRemoveId}></LogOutButton>
      </div>
    </div>
  );
}

export default BuktiPeminjaman;
