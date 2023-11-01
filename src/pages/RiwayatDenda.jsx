import React, { useEffect, useState } from "react";
import SectionHeading from "../components/SectionHeading";
import axios from "axios";
import TransactionDataTable from "../components/TransactionDataTable";
import BookDataTable from "../components/BookDataTable";

function RiwayatDenda() {
  const storedData = localStorage.getItem("userData");
  const userData = JSON.parse(storedData);
  const [transaction, setTransaction] = useState([]);

  const [books, setBooks] = useState([]);
  const [booksData, setBooksData] = useState([]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        "https://server.libraryselfservice.site/denda-buku"
      );
      const bookFiltered = response.data.filter((data) => {
        return data.id_peminjam === userData.id;
      });

      const bookDetailPromises = bookFiltered.map((book) => {
        return axios.get(
          `https://server.libraryselfservice.site/data-buku/${book.kode_barcode}`
        );
      });

      const bookDetailResponses = await Promise.all(bookDetailPromises);

      const bookDetails = bookDetailResponses.map(
        (response) => response.data[0]
      );

      console.log(bookDetails);

      setBooks(bookFiltered);
      setBooksData(bookDetails);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const fetchTransaction = async () => {
    try {
      const response = await axios.get(
        `https://server.libraryselfservice.site/transaction`
      );
      const data = await response.data.filter((data) => {
        return data.denda === 1;
      });
      console.log(response.data);
      setTransaction(response);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  useEffect(() => {
    fetchTransaction();
    fetchBooks();
    console.log(books);
  }, []);

  return (
    <div className="mx-5 my-5">
      <SectionHeading title={"Riwayat Denda"}></SectionHeading>
      <h2 className="text-2xl">Selamat Datang, {userData.nama}</h2>
      <div className=" mx-10 mt-10 mb-5 ">
        <h2 className="text-2xl font-bold">List Transaksi</h2>
      </div>
      <hr
        style={{
          border: "0.5px solid #e2dddd",
        }}
      />
      <div>
        <TransactionDataTable transactions={transaction} tipeData={"denda"} />
      </div>

      <div className=" mx-10 mt-10 mb-5 ">
        <h2 className="text-2xl font-bold">List Buku</h2>
      </div>
      <hr
        style={{
          border: "0.5px solid #e2dddd",
        }}
      />
      <div>
        <BookDataTable books={booksData} />
      </div>
    </div>
  );
}

export default RiwayatDenda;
