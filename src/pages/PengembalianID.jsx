import React, { useEffect, useState } from "react";
import { Button, TextInput, Modal } from "flowbite-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineCloseCircle } from "react-icons/ai";

function PengembalianID() {
  const [idTransaksi, setIdTransaksi] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [lastId, setLastId] = useState(null);

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    setIdTransaksi(event.target.value);
  };

  const fetchLastTransaction = async () => {
    try {
      const response = await axios.get(
        `https://server.libraryselfservice.site/transaction`
      );

      const userData = JSON.parse(localStorage.getItem("userData"));
      const userTransactions = response.data.filter(
        (item) => item.id_user === userData.id
      );

      userTransactions.sort((a, b) => b.timestamp - a.timestamp);

      if (userTransactions.length > 0) {
        const lastTransaction = userTransactions.slice(-1);
        setLastId(lastTransaction[0].id_transaksi);
      } else {
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchLastTransaction();
  }, []);

  const fetchTransaction = async () => {
    try {
      const response = await axios.get(
        `https://server.libraryselfservice.site/fetch-transaction/${idTransaksi}`
      );
      if (response && response.data) {
        if (response.data.id_transaksi !== lastId) {
          setModalVisible(true);
          setModalContent("ID Transaksi yang Anda masukkan salah");
        } else {
          navigate("/konfirmasi-pengembalian", { state: { id: idTransaksi } });
        }
      } else {
        setModalVisible(true);
        setModalContent("ID Transaksi yang Anda masukkan salah");
      }
    } catch (error) {
      console.error("Error fetching transaction:", error.response.data);
      setModalVisible(true);
      setModalContent("ID Transaksi yang Anda masukkan salah");
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <div className="container flex justify-center flex-col items-center w-full my-20">
      <Modal onClose={closeModal} show={modalVisible}>
        <Modal.Body className="row justify-center text-center">
          <AiOutlineCloseCircle className="mx-auto mb-4 h-14 w-14 text-red-400 dark:text-gray-200" />
          <p className="text-lg font-normal text-gray-500">{modalContent}</p>
        </Modal.Body>
        <Modal.Footer className="flex justify-center">
          <Button onClick={closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
      {console.log(lastId)}
      <h1 className="text-3xl font-bold">Layanan Pengembalian Buku Mandiri</h1>
      <span className="text-xl mt-5">Silakan masukkan ID Transaksi anda</span>
      <span className="">
        (Cek ID Transaksi anda pada Dashboard atau Email bukti peminjaman anda)
      </span>
      <div className="w-4/6 my-10">
        <TextInput
          id="id_transaksi"
          value={idTransaksi}
          onChange={handleInputChange}
        />
      </div>
      <Button onClick={fetchTransaction}>Submit</Button>
    </div>
  );
}

export default PengembalianID;
