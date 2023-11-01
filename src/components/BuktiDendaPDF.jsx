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
    fontSize: 8,
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

function BuktiDendaPDF(props) {
  const waktuPeminjaman = props.waktuPeminjaman;
  const waktuPengembalian = props.waktuPengembalian;
  const jumlahHariTerlambat = props.jumlahHariTerlambat;
  const denda = props.denda;
  const bukuHilang = props.bukuHilang;
  const bukuPerPage = 1;

  const bukuPages = divideArrayIntoPages(bukuHilang, bukuPerPage);

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
                <Text style={styles.header}>Detail Denda</Text>
                <Text style={styles.text}>{waktuPeminjaman}</Text>
                <Text style={styles.text}>sampai</Text>
                <Text style={styles.text}>{waktuPengembalian}</Text>
                <Text style={styles.text}>Akumulasi Denda :</Text>
                <Text
                  style={styles.text}
                >{`${jumlahHariTerlambat} hari x 10.0000 = ${denda}`}</Text>
              </>
            )}
            <Text style={styles.space}>
              {"\n"}Keterangan buku yang belum{"\n"}dikembalikan :
            </Text>
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

export default BuktiDendaPDF;
