import React, { useEffect, useState } from "react";
import { Table, Button } from "flowbite-react";
import axios from "axios";
import PopUp from "../components/PopUp";
import emailjs from "@emailjs/browser";

function KonfirmasiPeminjaman() {
  const [bukuPinjamData, setBukuPinjamData] = useState([]);
  const [todayDate, setTodayDate] = useState("");
  const [oneWeekLaterDate, setOneWeekLaterDate] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const storedData = localStorage.getItem("userData");
  const userData = JSON.parse(storedData);

  useEffect(() => {
    const storedData = localStorage.getItem("bukuPinjamData");
    if (storedData) {
      setBukuPinjamData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const oneWeekLater = new Date(
      currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );
    setTodayDate(
      currentDate.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setOneWeekLaterDate(
      oneWeekLater.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  async function addTransaction() {
    try {
      const currentDate = new Date();
      const oneWeekLater = new Date(
        currentDate.getTime() + 7 * 24 * 60 * 60 * 1000
      );

      let barcodes = "";
      bukuPinjamData.forEach((buku) => {
        if (barcodes === "") {
          barcodes = `${buku.code}`;
        } else {
          barcodes += `,${buku.code}`;
        }
      });

      console.log(barcodes);
      const newTransaction = {
        id_user: userData.id,
        kode_barcode: barcodes,
        tanggal_pinjam: currentDate,
        tenggat_kembali: oneWeekLater,
        status: "Dipinjam",
      };
      console.log(newTransaction);
      const response = await axios.post(
        `https://server.libraryselfservice.site/add-transaksi`,
        newTransaction
      );
      const transactionId = response.data.transactionId;

      bukuPinjamData.forEach(async (buku) => {
        const response = await axios.put(
          `https://server.libraryselfservice.site/data-buku/${buku.code}`,
          {
            tersedia: false,
            peminjam: userData.id,
            tenggat_kembali: oneWeekLater,
          }
        );

        const bukuDipinjam = await axios.post(
          `https://server.libraryselfservice.site/buku-dipinjam`,
          {
            id_transaksi: transactionId,
            id_buku: buku.code,
            hilang: false,
          }
        );
      });
      sendEmail({
        userName: userData.nama,
        id: transactionId,
        userEmail: userData.email,
      });
      localStorage.removeItem("bukuPinjamData");
      console.log("Transaction added successfully:", response.data);
      localStorage.setItem("idTransaksi", transactionId);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error adding transaction:", error.response);
    }
  }

  const sendEmail = ({ userName, id, tenggatKembali, userEmail }) => {
    emailjs.init("liKPdZ4kUvRtaLSDM");
    const serviceID = "service_l5f0wig";
    const templateID = "template_c39crpp";
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
    <div className="container flex justify-center flex-col items-center w-full my-20">
      {isSuccess && (
        <PopUp
          contentText="Peminjaman Berhasil"
          primaryBtn="Cetak Bukti Peminjaman"
          secondaryBtn="Kembali ke Menu Utama"
          primaryPath="/bukti-peminjaman"
          secondaryPath="/home"
          icon="berhasil"
        />
      )}
      <h1 className="text-3xl font-bold">Layanan Peminjaman Buku Mandiri</h1>
      <div className="w-4/6 my-10">
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
            {bukuPinjamData.map((code, index) => (
              <Table.Row
                className="bg-white dark:border-gray-700 dark:bg-gray-800"
                key={code.code}
              >
                <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {index + 1}
                </Table.Cell>
                <Table.Cell>{code.pengarang}</Table.Cell>
                <Table.Cell>{code.judul}</Table.Cell>
                <Table.Cell>{code.penerbit}</Table.Cell>
                <Table.Cell>{code.tahun_terbit}</Table.Cell>
                <Table.Cell>{code.code}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <div className="w-2/5 my-5 text-center">
        <h3 className="mb-10 font-bold">Waktu Peminjaman :</h3>
        <div className="flex justify-around mb-10">
          <p>{todayDate}</p>
          <p>Sampai</p>
          <p>{oneWeekLaterDate}</p>
        </div>
      </div>
      <Button onClick={addTransaction}>Konfirmasi</Button>
    </div>
  );
}

export default KonfirmasiPeminjaman;
