import React, { useEffect, useState } from "react";
import { Table, Button } from "flowbite-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import PopUp from "../components/PopUp";

function KonfirmasiPengembalian() {
  const location = useLocation();
  const id_transaksi = location.state && location.state.id;

  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [books, setBooks] = useState([]);
  const [tanggalPinjam, setTanggalPinjam] = useState("");
  const [tanggalKembali, setTanggalKembali] = useState("");
  const [denda, setDenda] = useState(null);
  const [sudahKembali, setSudahKembali] = useState(false);

  const fetchTransaction = async () => {
    try {
      const response = await axios.get(
        `https://server.libraryselfservice.site/fetch-transaction/${id_transaksi}`
      );

      if (response && response.data) {
        setTransaction(response.data);
        const tanggalPinjamUnformatted = new Date(response.data.tanggal_pinjam);
        const tanggalKembaliUnformatted = new Date(
          response.data.tenggat_kembali
        );
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

        let date1 = tanggalKembaliUnformatted;
        let date2 = new Date();
        let diffDays = 0;

        date1.setHours(0, 0, 0, 0);
        date2.setHours(0, 0, 0, 0);

        if (date2 > date1) {
          const timeDiff = Math.abs(date2.getTime() - date1.getTime());
          diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        }

        if (diffDays <= 0) {
          setDenda(0);
        } else {
          setDenda(diffDays * 10000);
        }

        const barcodePromises = response.data.kode_barcode
          .split(",")
          .map(async (barcode) => {
            const bookResponse = await axios.get(
              `https://server.libraryselfservice.site/data-buku/${barcode}`
            );
            if (
              bookResponse &&
              bookResponse.data &&
              bookResponse.data.length > 0
            ) {
              return bookResponse.data[0];
            }
            return null;
          });

        const bookData = await Promise.all(barcodePromises);

        if (response.data.status === "Selesai") {
          setSudahKembali(true);
        }

        let dataTransaksi = {
          id: id_transaksi,
          books: bookData,
          deadline_pengembalian: new Date(response.data.tenggat_kembali),
          tanggal_pinjam: new Date(response.data.tanggal_pinjam),
          denda: denda,
          status: response.data.status,
        };
        localStorage.setItem("dataTransaksi", JSON.stringify(dataTransaksi));
        setBooks(bookData);
      } else {
        console.error("Invalid response:", response);
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  };

  useEffect(() => {
    fetchTransaction();
    localStorage.removeItem("scannedBooks");
    localStorage.removeItem("unscannedBooks");
    localStorage.removeItem("scannedCodes");
  }, []);

  if (!transaction) {
    return <div>Loading transaction details...</div>;
  }

  const clickHandler = () => {
    localStorage.setItem("denda", denda);
    navigate("/scan-kembali");
  };

  const dendaHandler = () => {
    localStorage.setItem("denda", denda);
    navigate("/pembayaran-denda");
  };

  const formattedDenda = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(denda);

  return (
    <div className="container flex justify-center flex-col items-center w-full my-20">
      <h1 className="text-3xl font-bold">Layanan Pengembalian Buku Mandiri</h1>
      <div className="w-4/6 my-10">
        {sudahKembali && (
          <PopUp
            btnQty="1"
            primaryBtn="Kembali"
            primaryPath="/pengembalian-id"
            contentText="Transaksi sudah dikembalikan"
          />
        )}
        {console.log()}

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
            {books.map((book, index) => (
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
      <div className="w-2/5 my-5 text-center">
        <h3 className="font-bold">Waktu Peminjaman :</h3>
        <div className="flex justify-around mt-8">
          <p>{tanggalPinjam}</p>
          <p>Sampai</p>
          <p>{tanggalKembali}</p>
        </div>
      </div>
      <div className="w-2/3 my-5">
        <p className="font-bold">Akumulasi Denda :</p>
        {denda === 0 ? (
          <div>
            <p>Tidak ada akumulasi denda</p>
            <p className="font-bold">
              *jika telat mengembalikan buku maka dihitung denda perhari :
              Rp.10.000
            </p>
            <div className="flex justify-center my-10">
              <Button onClick={clickHandler}>Scan Buku</Button>
            </div>
          </div>
        ) : (
          <div>
            {" "}
            <p>{formattedDenda}</p>{" "}
            <p className="font-bold">
              *jika telat mengembalikan buku maka dihitung denda perhari :
              Rp.10.000
            </p>
            <div className="flex justify-center my-10">
              <Button onClick={dendaHandler}>Bayar denda</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KonfirmasiPengembalian;
