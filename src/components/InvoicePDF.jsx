import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#333333',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    color: '#000000',
  },
  value: {
    width: '60%',
    color: '#000000',
  },
  table: {
    display: 'table',
    width: '100%',
    marginTop: 20,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableColHeader: {
    width: '25%',
    padding: 10,
    fontWeight: 'bold',
  },
  tableCol: {
    width: '25%',
    padding: 10,
  },
  tableColHeaderLarge: {
    width: '75%',
    padding: 10,
    fontWeight: 'bold',
  },
  tableColLarge: {
    width: '75%',
    padding: 10,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  totalBox: {
    width: '40%',
    borderTopWidth: 2,
    borderTopColor: '#000000',
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    alignItems: 'center',
  },
  footerLogo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
    marginBottom: 10,
    opacity: 0.5,
  },
  footerText: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 3,
  }
});

const InvoicePDF = ({ orderDetails }) => {
  const { 
    studentName, 
    studentEmail, 
    orderId, 
    purchaseDate, 
    expiryDate, 
    amount,
    discount
  } = orderDetails;

  const logoUrl = 'https://anirbansacademy.com/img/logo.png';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top Logo */}
        <View style={styles.logoContainer}>
          <Image src={logoUrl} style={styles.logo} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Anirban's Academy</Text>
          <Text style={styles.subtitle}>Payment Receipt</Text>
        </View>

        {/* Invoice Info */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
          <View style={{ width: '45%' }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14, textTransform: 'uppercase' }}>Billed To:</Text>
            <Text style={{ marginBottom: 4 }}>{studentName}</Text>
            <Text>{studentEmail}</Text>
          </View>
          <View style={{ width: '45%' }}>
            <View style={styles.row}>
              <Text style={styles.label}>Receipt No:</Text>
              <Text style={styles.value}>{orderId || 'N/A'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date:</Text>
              <Text style={styles.value}>{new Date(purchaseDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Mode:</Text>
              <Text style={styles.value}>Online Payment</Text>
            </View>
          </View>
        </View>

        {/* Order Details Table */}
        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.tableColHeaderLarge}>
              <Text>DESCRIPTION</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={{ textAlign: 'right' }}>AMOUNT</Text>
            </View>
          </View>
          {orderDetails.items && orderDetails.items.length > 0 ? (
            orderDetails.items.map((item, index) => (
              <View style={styles.tableRow} key={index}>
                <View style={styles.tableColLarge}>
                  <Text style={{ fontWeight: 'bold' }}>{item.description}</Text>
                  <Text style={{ color: '#666666', fontSize: 10, marginTop: 6 }}>
                    {item.detail}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={{ textAlign: 'right' }}>₹{item.amount}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={styles.tableColLarge}>
                <Text style={{ fontWeight: 'bold' }}>Premium Monthly Test Subscription</Text>
                <Text style={{ color: '#666666', fontSize: 10, marginTop: 6 }}>
                  Validity Ends: {new Date(expiryDate).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={{ textAlign: 'right' }}>₹{amount}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Total Box */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            {discount && discount.amount > 0 ? (
              <>
                <View style={[styles.row, { marginBottom: 6 }]}>
                  <Text style={{ fontSize: 12 }}>SUBTOTAL:</Text>
                  <Text style={{ textAlign: 'right', flex: 1, fontSize: 12 }}>₹{discount.subtotal}</Text>
                </View>
                <View style={[styles.row, { marginBottom: 8 }]}>
                  <Text style={{ fontSize: 12, color: '#16a34a' }}>
                    {discount.couponCode ? `DISCOUNT (COUPON ${discount.couponCode}):` : `DISCOUNT (${discount.percentage}%):`}
                  </Text>
                  <Text style={{ textAlign: 'right', flex: 1, fontSize: 12, color: '#16a34a' }}>- ₹{discount.amount}</Text>
                </View>
              </>
            ) : null}
            <View style={styles.row}>
              <Text style={{ fontWeight: 'bold', fontSize: 14 }}>TOTAL PAID:</Text>
              <Text style={{ fontWeight: 'bold', textAlign: 'right', flex: 1, fontSize: 14 }}>₹{amount}</Text>
            </View>
          </View>
        </View>

        {/* Footer with Bottom Logo */}
        <View style={styles.footer}>
          <Image src={logoUrl} style={styles.footerLogo} />
          <Text style={styles.footerText}>Thank you for your purchase.</Text>
          <Text style={styles.footerText}>This is a computer generated receipt and does not require a signature.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
