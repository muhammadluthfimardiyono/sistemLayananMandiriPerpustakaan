import { Table } from "flowbite-react";
import React, { useEffect, useState } from "react";
import BuktiDenda from "./BuktiDenda";

function PembayaranDenda() {
  const [tanggalPinjam, setTanggalPinjam] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [denda, setDenda] = useState(null);
  const [unscannedBooks, setUnscannedBooks] = useState([]);
  const [booksData, setbooksData] = useState(null);

  useEffect(() => {
    const dataTransaksi = localStorage.getItem("dataTransaksi");
    setDenda(JSON.parse(localStorage.getItem("denda")));

    const dataUnscannedBooks = localStorage.getItem("unscannedBooks");
    setUnscannedBooks(JSON.parse(dataUnscannedBooks));

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

    if (localStorage.getItem("dataTransaksi")) {
      console.log(JSON.parse(localStorage.getItem("dataTransaksi")));
      setbooksData(JSON.parse(localStorage.getItem("dataTransaksi")).books);
    }
  }, []);

  return (
    <div className="my-14 w-full">
      <h1 className="text-3xl font-bold">Layanan Pengembalian Buku Mandiri</h1>
      <div className="my-14 mx-20">
        <h2 className="text-xl font-bold">Detail Denda</h2>
        <div className="my-5">
          <h3 className="font-bold">Waktu Peminjaman</h3>
          <div className="grid grid-cols-3 gap-2">
            <p>{tanggalPinjam}</p>
            <p>Sampai</p>
            <p>{tanggalKembali}</p>
          </div>
        </div>
        <div className="my-5">
          <h3 className="font-bold">Akumulasi Denda</h3>
          <p>{`${denda / 10000} hari x 10.000= ${denda}`}</p>
        </div>
        <div className="my-5">
          <h3 className="font-bold">Keterangan buku yang belum dikembalikan</h3>
          <div className="w-5/6 my-10">
            <Table hoverable={true} className="w-full">
              <Table.Head>
                <Table.HeadCell>No.</Table.HeadCell>
                <Table.HeadCell>Pengarang</Table.HeadCell>
                <Table.HeadCell>Judul</Table.HeadCell>
                <Table.HeadCell>Penerbit</Table.HeadCell>
                <Table.HeadCell>Tahun Terbit</Table.HeadCell>
                <Table.HeadCell>Kode Buku</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {unscannedBooks === null
                  ? booksData.map((book, index) => (
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
                      </Table.Row>
                    ))
                  : unscannedBooks.map((book, index) => (
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
                      </Table.Row>
                    ))}
              </Table.Body>
            </Table>
          </div>
          <div className="text-center">
            <span className="text-md font-bold my-3">
              Bayar denda anda kepada Admin untuk menyelesaikan transaksi Anda
            </span>
          </div>
          <BuktiDenda></BuktiDenda>
        </div>
      </div>
    </div>
  );
}

export default PembayaranDenda;
