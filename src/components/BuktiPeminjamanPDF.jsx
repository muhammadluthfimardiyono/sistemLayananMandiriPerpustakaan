import { Page, Text, Document, StyleSheet, View } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  body: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  header: {
    fontSize: 10,
    marginBottom: 6,
    fontWeight: "bold",
    textAlign: "center",
  },
  number: {
    fontSize: 12,
    marginVertical: 6,
    textAlign: "center",
    fontWeight: "bold",
  },
  text: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 4,
  },
  bookContainer: {
    marginVertical: 2,
    marginHorizontal: 5,
  },
  book: {
    fontSize: 8,
    textAlign: "left",
    marginLeft: 2,
    marginRight: 8,
  },
  space: {
    fontSize: 10,
    marginTop: 3,
    marginBottom: 2,
    marginLeft: 5,
    fontWeight: "bold",
    textAlign: "left",
  },
});

function divideArrayIntoPages(array, itemsPerPage) {
  const pages = [];
  for (let i = 0; i < array.length; i += itemsPerPage) {
    const page = array.slice(i, i + itemsPerPage);
    pages.push(page);
  }
  return pages;
}

function BuktiPeminjamanPDF(props) {
  const idTransaksi = props.idTransaksi;
  const waktuPeminjaman = props.waktuPeminjaman;
  const deadlinePengembalian = props.deadlinePengembalian;
  const buku = props.buku;
  const bukuPerPage = 1;

  const bukuPages = divideArrayIntoPages(buku, bukuPerPage);

  return (
    <Document>
      {bukuPages.map((bukuPage, pageIndex) => (
        <Page
          key={pageIndex}
          style={styles.body}
          size={"A9"}
          orientation="landscape"
        >
          <View>
            {pageIndex === 0 && (
              <>
                <Text style={styles.header}>Bukti Peminjaman Buku</Text>
                <Text style={styles.number}>{idTransaksi}</Text>
                <Text style={styles.text}>{waktuPeminjaman}</Text>
                <Text style={styles.text}>sampai</Text>
                <Text style={styles.text}>{deadlinePengembalian}</Text>
              </>
            )}
            <Text style={styles.space}>{"\n"}Buku yang Dipinjam :</Text>
            <View style={styles.bookContainer}>
              {bukuPage.map((bukuItem, index) => (
                <Text key={index} style={styles.book}>
                  No : {index + 1 + pageIndex * bukuPerPage}
                  {"\n"}Pengarang: {bukuItem.pengarang}
                  {"\n"}Judul: {bukuItem.judul}
                  {"\n"}Penerbit: {bukuItem.penerbit}
                  {"\n"}Tahun Terbit: {bukuItem.tahun_terbit}
                </Text>
              ))}
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
}

export default BuktiPeminjamanPDF;
