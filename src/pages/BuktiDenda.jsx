import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import BuktiDendaPDF from "../components/BuktiDendaPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import axios from "axios";

function BuktiDenda() {
  const [tanggalPinjam, setTanggalPinjam] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [denda, setDenda] = useState(null);
  const [unscannedBooks, setUnscannedBooks] = useState([]);

  useEffect(() => {
    const dataTransaksi = localStorage.getItem("dataTransaksi");
    setDenda(JSON.parse(localStorage.getItem("denda")));

    const dataUnscannedBooks = localStorage.getItem("unscannedBooks");
    if (dataUnscannedBooks) {
      setUnscannedBooks(JSON.parse(dataUnscannedBooks));
    } else {
      setUnscannedBooks(
        JSON.parse(localStorage.getItem("dataTransaksi")).books
      );
    }

    const tanggalPinjamUnformatted = new Date(
      JSON.parse(dataTransaksi).tanggal_pinjam
    );
    const tanggalKembaliUnformatted = new Date();
    setTanggalPinjam(
      tanggalPinjamUnformatted.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setTanggalKembali(
      tanggalKembaliUnformatted.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const handleBukuHilang = async () => {
    await Promise.all(
      unscannedBooks.map(async (book) => {
        const response = await axios.put(
          `https://server.libraryselfservice.site/buku-hilang/${book.kode_barcode}`
        );
      })
    );
  };

  return (
    <div className="flex justify-center flex-col items-center w-full">
      <div className="grid grid-cols-2 gap-10 my-10">
        <PDFDownloadLink
          document={
            <BuktiDendaPDF
              waktuPeminjaman={tanggalPinjam}
              waktuPengembalian={tanggalKembali}
              jumlahHariTerlambat={denda / 10000}
              denda={denda}
              bukuHilang={unscannedBooks}
            />
          }
          fileName="Bukti Denda"
        >
          {({ loading }) =>
            loading ? (
              <Button>Loading Document...</Button>
            ) : (
              <Button onClick={handleBukuHilang}>Download</Button>
            )
          }
        </PDFDownloadLink>

        <Link to={"/home"}>
          <Button onClick={handleBukuHilang}>Kembali ke Home</Button>
        </Link>
      </div>
    </div>
  );
}

export default BuktiDenda;
