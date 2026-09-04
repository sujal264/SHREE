import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'mr' | 'en';

export interface Translations {
  // Mandal & Taglines
  mandalName: string;
  mandalNameEn: string;
  mandalTagline: string;
  organizerDefault: string;
  locationDefault: string;
  selectFestivalYear: string;
  activeFestival: string;
  festivalYear: string;
  personalFinanceBadge: string;
  personalFinanceSub: string;

  // Navigation
  dashboard: string;
  dashboardSub: string;
  donations: string;
  donationsSub: string;
  expenses: string;
  expensesSub: string;
  ledger: string;
  ledgerSub: string;
  reports: string;
  reportsSub: string;
  settings: string;
  settingsSub: string;

  // Header & Treasury
  liveTreasury: string;
  totalBalanceLabel: string;
  balanceCalculationHint: string;
  balanceCalculationFormula: string;
  quickAddDonation: string;
  quickAddExpense: string;
  donationReceiptBtn: string;
  expenseEntryBtn: string;

  // Dashboard Metrics
  openingBalance: string;
  openingBalanceSub: string;
  totalDonations: string;
  totalDonationsSub: string;
  totalExpenses: string;
  totalExpensesSub: string;
  currentBalance: string;
  currentBalanceSub: string;
  pendingAmount: string;
  pendingAmountSub: string;
  netSurplus: string;
  confirmedReceiptsCount: string;
  totalVouchersCount: string;
  recentDonations: string;
  recentExpenses: string;

  // Alerts
  deficitAlertTitle: string;
  deficitAlertDesc: string;
  warningAlertTitle: string;
  warningAlertDesc: string;

  // Common Actions
  addDonation: string;
  addExpense: string;
  printReceipt: string;
  shareWhatsApp: string;
  downloadPDF: string;
  exportExcel: string;
  exportCSV: string;
  save: string;
  saveChanges: string;
  cancel: string;
  delete: string;
  deleteConfirm: string;
  edit: string;
  search: string;
  filter: string;
  all: string;
  allCategories: string;
  allPaymentMethods: string;
  allStatuses: string;
  reset: string;
  actions: string;
  viewAll: string;
  close: string;
  confirmDelete: string;

  // Fields & Tables
  receiptNumber: string;
  voucherNumber: string;
  billNumber: string;
  donorName: string;
  mobileNumber: string;
  address: string;
  amount: string;
  amountInWords: string;
  date: string;
  receivedDate: string;
  type: string;
  description: string;
  paymentMethod: string;
  category: string;
  transactionRef: string;
  notes: string;
  vendorPaid: string;
  billReceipt: string;
  expenseTitle: string;
  status: string;
  receivedFrom: string;
  receiptTitle: string;
  receiptBlessing: string;
  presidentSign: string;
  treasurerSign: string;
  secretarySign: string;

  // Statuses
  statusReceived: string;
  statusPending: string;
  statusCancelled: string;
  received: string;
  pending: string;
  cancelled: string;

  // Payment Methods
  cash: string;
  upi: string;
  bankTransfer: string;
  cheque: string;
  other: string;

  // Donation Categories
  catGeneral: string;
  catAarti: string;
  catPrasad: string;
  catSilverGold: string;
  catMahaAarti: string;
  catVisarjan: string;
  catAdvertisement: string;
  catOther: string;

  // Expense Categories
  expDecoration: string;
  expIdol: string;
  expLighting: string;
  expSound: string;
  expStage: string;
  expFlowers: string;
  expPrasad: string;
  expPooja: string;
  expAdvertising: string;
  expPrinting: string;
  expElectricity: string;
  expTransportation: string;
  expSecurity: string;
  expCleaning: string;
  expCultural: string;
  expCharity: string;
  expMisc: string;

  // Language switcher UI
  languageToggle: string;
  selectLanguage: string;
  marathi: string;
  english: string;
}

const mrTranslations: Translations = {
  // Mandal & Taglines
  mandalName: 'श्री साई मित्र मंडळ',
  mandalNameEn: 'SHREE SAI MITRA MANDAL',
  mandalTagline: '॥ ॐ साई राम ॥ ॥ श्री गणेशाय नमः ॥',
  organizerDefault: 'श्री साई मित्र मंडळ ट्रस्ट, पुणे',
  locationDefault: 'पुणे, महाराष्ट्र',
  selectFestivalYear: 'उत्सव वर्ष निवडा',
  activeFestival: 'सक्रिय उत्सव',
  festivalYear: 'उत्सव वर्ष',
  personalFinanceBadge: 'वैयक्तिक हिशोब व्यवस्थापन',
  personalFinanceSub: 'मंडळाचे नाव, पत्ता, सुरुवातीची शिल्लक रक्कम व पुढील वर्षाचे उत्सव व्यवस्थापन',

  // Navigation
  dashboard: 'मुख्य डॅशबोर्ड',
  dashboardSub: 'डॅशबोर्ड सारांश',
  donations: 'जमा व देणगी पावत्या',
  donationsSub: 'Donations & Receipts',
  expenses: 'मंडळ खर्च व व्हाउचर',
  expensesSub: 'Expenses & Vouchers',
  ledger: 'जमा-खर्च वही',
  ledgerSub: 'Transaction Ledger',
  reports: 'ताळेबंद व अहवाल',
  reportsSub: 'Balance Sheet & Reports',
  settings: 'मंडळ माहिती व सेटिंग्ज',
  settingsSub: 'Mandal Settings',

  // Header & Treasury
  liveTreasury: 'एकूण शिल्लक रक्कम (Live Treasury)',
  totalBalanceLabel: 'एकूण शिल्लक:',
  balanceCalculationHint: 'सुरुवातीची शिल्लक + एकूण जमा - एकूण खर्च',
  balanceCalculationFormula: 'सुरुवातीची शिल्लक + एकूण जमा - एकूण खर्च = चालू शिल्लक',
  quickAddDonation: '+ नवीन जमा पावती',
  quickAddExpense: '+ नवीन खर्च नोंद',
  donationReceiptBtn: 'जमा पावती',
  expenseEntryBtn: 'खर्च नोंद',

  // Dashboard Metrics
  openingBalance: 'सुरुवातीची शिल्लक',
  openingBalanceSub: 'मागील वर्षातून पुढे आणलेली शिल्लक',
  totalDonations: 'एकूण जमा / वर्गणी',
  totalDonationsSub: 'पावत्या व ऑनलाईन देणग्या',
  totalExpenses: 'एकूण खर्च',
  totalExpensesSub: 'मंडप, रोषणाई व इतर खर्च',
  currentBalance: 'शिल्लक रक्कम (Treasury)',
  currentBalanceSub: 'मंडळाकडे प्रत्यक्ष उपलब्ध शिल्लक',
  pendingAmount: 'प्रलंबित रक्कम',
  pendingAmountSub: 'चेक/युपीआय क्लिअरन्स बाकी',
  netSurplus: 'निव्वळ शिल्लक नफा/तूट',
  confirmedReceiptsCount: 'जमा पावत्या',
  totalVouchersCount: 'खर्च व्हाऊचर्स',
  recentDonations: 'नुकत्याच झालेल्या जमा नोंदी',
  recentExpenses: 'नुकत्याच झालेल्या खर्च नोंदी',

  // Alerts
  deficitAlertTitle: 'मंडळ खर्च शिल्लक रकमेपेक्षा जास्त झाला आहे!',
  deficitAlertDesc: 'एकूण खर्च उपलब्ध शिल्लक व जमा रकमेपेक्षा जास्त झाला आहे. कृपया खर्चाची नोंद तपासा.',
  warningAlertTitle: 'शिल्लक रक्कम कमी होत आहे!',
  warningAlertDesc: 'मंडळाची चालू शिल्लक ₹५,००० पेक्षा कमी झाली आहे.',

  // Common Actions
  addDonation: 'नवीन जमा नोंदवा',
  addExpense: 'नवीन खर्च नोंदवा',
  printReceipt: 'पावती प्रिंट करा',
  shareWhatsApp: 'व्हॉट्सॲपवर पाठवा',
  downloadPDF: 'पीडीएफ डाउनलोड करा',
  exportExcel: 'एक्सेल (Excel) निर्यात',
  exportCSV: 'सीएसव्ही (CSV) निर्यात',
  save: 'जतन करा',
  saveChanges: 'बदल जतन करा',
  cancel: 'रद्द करा',
  delete: 'हटवा',
  deleteConfirm: 'तुम्हाला नक्की ही नोंद हटवायची आहे का?',
  edit: 'बदला / एडिट',
  search: 'शोधा (नाव, पावती क्र., मोबाईल...)',
  filter: 'फिल्टर',
  all: 'सर्व',
  allCategories: 'सर्व वर्गवारी (All Categories)',
  allPaymentMethods: 'सर्व पेमेंट पद्धती (All Modes)',
  allStatuses: 'सर्व स्थिती (All Status)',
  reset: 'रीसेट करा',
  actions: 'कृती',
  viewAll: 'सर्व पहा',
  close: 'बंद करा',
  confirmDelete: 'तुम्हाला नक्की ही नोंद हटवायची आहे का?',

  // Fields & Tables
  receiptNumber: 'पावती क्र.',
  voucherNumber: 'व्हाउचर / बिल क्र.',
  billNumber: 'बिल / व्हाऊचर क्र.',
  donorName: 'वर्गणीदार / देणगीदाराचे नाव',
  mobileNumber: 'मोबाईल नंबर',
  address: 'पत्ता',
  amount: 'रक्कम (₹)',
  amountInWords: 'अक्षरी रक्कम',
  date: 'दिनांक',
  receivedDate: 'जमा दिनांक',
  type: 'प्रकार',
  description: 'तपशील / कारण',
  paymentMethod: 'देयक पद्धत',
  category: 'प्रकार / वर्गवारी',
  transactionRef: 'व्यवहार संदर्भ (UTR / Cheque No)',
  notes: 'शेरा / टीप',
  vendorPaid: 'कोणास दिले / दुकानदार नाव',
  billReceipt: 'बिल / पावती प्रत',
  expenseTitle: 'खर्चाचे शीर्षक / कारण',
  status: 'स्थिती',
  receivedFrom: 'पावती ज्यांच्याकडून मिळाली',
  receiptTitle: 'श्री साई मित्र मंडळ - अधिकृत देणगी पावती',
  receiptBlessing: 'श्री साई व बाप्पांच्या आशीर्वादाने आपले जीवन सुख-समृद्धीने भरून जावो!',
  presidentSign: 'अध्यक्ष / मुख्य विश्वस्त',
  treasurerSign: 'खजिनदार / हिशोब प्रमुख',
  secretarySign: 'कार्यवाह / सेक्रेटरी',

  // Statuses
  statusReceived: 'जमा झाले',
  statusPending: 'प्रलंबित',
  statusCancelled: 'रद्द',
  received: 'जमा झाले',
  pending: 'प्रलंबित',
  cancelled: 'रद्द',

  // Payment Methods
  cash: 'रोख (Cash)',
  upi: 'युपीआय (UPI)',
  bankTransfer: 'बँक ट्रान्सफर (Bank Transfer)',
  cheque: 'धनादेश (Cheque)',
  other: 'इतर (Other)',

  // Donation Categories
  catGeneral: 'सर्वसाधारण वर्गणी / देणगी',
  catAarti: 'आरती व पूजा सेवा',
  catPrasad: 'महाप्रसाद अन्नदान',
  catSilverGold: 'विशेष देणगीदार / प्रायोजक',
  catMahaAarti: 'महाआरती देणगी',
  catVisarjan: 'विसर्जन मिरवणूक वर्गणी',
  catAdvertisement: 'जाहिरात व बॅनर',
  catOther: 'इतर जमा देणगी',

  // Expense Categories
  expDecoration: 'मंडप व सजावट',
  expIdol: 'श्री गणेश',
  expLighting: 'विद्युत रोषणाई',
  expSound: 'ध्वनीक्षेपके व साऊंड सिस्टीम',
  expStage: 'स्टेज व मंडप बॅकड्रॉप',
  expFlowers: 'हार व फुले सजावट',
  expPrasad: 'महाप्रसाद व भोजन',
  expPooja: 'पूजा साहित्य व विधी',
  expAdvertising: 'जाहिरात व प्रसिद्धी',
  expPrinting: 'पावती पुस्तक व छपाई',
  expElectricity: 'वीज व जनरेटर भाडे',
  expTransportation: 'वाहतूक व टेम्पो भाडे',
  expSecurity: 'सुरक्षा व रक्षक',
  expCleaning: 'स्वच्छता साहित्य',
  expCultural: 'सांस्कृतिक कार्यक्रम',
  expCharity: 'सामाजिक मदत व दान',
  expMisc: 'इतर किरकोळ खर्च',

  // Language switcher UI
  languageToggle: 'भाषा',
  selectLanguage: 'भाषा निवडा',
  marathi: 'मराठी',
  english: 'English',
};

const enTranslations: Translations = {
  // Mandal & Taglines
  mandalName: 'Shree Sai Mitra Mandal',
  mandalNameEn: 'SHREE SAI MITRA MANDAL',
  mandalTagline: '|| Om Sai Ram || || Shree Ganeshaya Namah ||',
  organizerDefault: 'Shree Sai Mitra Mandal Trust, Pune',
  locationDefault: 'Pune, Maharashtra',
  selectFestivalYear: 'Select Festival Year',
  activeFestival: 'Active Festival',
  festivalYear: 'Festival Year',
  personalFinanceBadge: 'Personal Finance Manager',
  personalFinanceSub: 'Track income, manage expense vouchers, and maintain books cleanly.',

  // Navigation
  dashboard: 'Dashboard',
  dashboardSub: 'Financial Overview',
  donations: 'Donations & Receipts',
  donationsSub: 'Inflow & Devotee Slips',
  expenses: 'Expenses & Vouchers',
  expensesSub: 'Outflow & Vendor Bills',
  ledger: 'Transaction Ledger',
  ledgerSub: 'Daily Cash & Bank Book',
  reports: 'Audit & Reports',
  reportsSub: 'Annual Balance Sheets',
  settings: 'Mandal Settings',
  settingsSub: 'Years & Balances',

  // Header & Treasury
  liveTreasury: 'Total Available Balance (Live Treasury)',
  totalBalanceLabel: 'Total Balance:',
  balanceCalculationHint: 'Opening Balance + Total Inflow - Total Outflow',
  balanceCalculationFormula: 'Opening Balance + Total Donations - Total Expenses = Available Balance',
  quickAddDonation: '+ New Donation Slip',
  quickAddExpense: '+ New Expense Entry',
  donationReceiptBtn: 'Donation Slip',
  expenseEntryBtn: 'Expense Entry',

  // Dashboard Metrics
  openingBalance: 'Opening Balance',
  openingBalanceSub: 'Brought forward from previous year',
  totalDonations: 'Total Donations',
  totalDonationsSub: 'Received receipts and digital funds',
  totalExpenses: 'Total Expenses',
  totalExpensesSub: 'Decorations, lighting, and utilities',
  currentBalance: 'Available Balance',
  currentBalanceSub: 'Live cash and bank liquidity',
  pendingAmount: 'Pending Amount',
  pendingAmountSub: 'Uncleared cheque or UPI confirmations',
  netSurplus: 'Net Balance Surplus/Deficit',
  confirmedReceiptsCount: 'Donation Slips',
  totalVouchersCount: 'Expense Bills',
  recentDonations: 'Recent Donation Receipts',
  recentExpenses: 'Recent Expense Vouchers',

  // Alerts
  deficitAlertTitle: 'Expenses exceed available funds!',
  deficitAlertDesc: 'Total expenditure exceeds available balance and inflow. Please review recent expense vouchers.',
  warningAlertTitle: 'Low treasury balance warning!',
  warningAlertDesc: 'Current mandal balance is less than ₹5,000.',

  // Common Actions
  addDonation: 'New Donation Receipt',
  addExpense: 'New Expense Voucher',
  printReceipt: 'Print Receipt',
  shareWhatsApp: 'Share on WhatsApp',
  downloadPDF: 'Download PDF',
  exportExcel: 'Export Excel',
  exportCSV: 'Export CSV',
  save: 'Save',
  saveChanges: 'Save Changes',
  cancel: 'Cancel',
  delete: 'Delete',
  deleteConfirm: 'Are you sure you want to delete this record?',
  edit: 'Edit',
  search: 'Search (Name, Receipt No., Mobile...)',
  filter: 'Filter',
  all: 'All',
  allCategories: 'All Categories',
  allPaymentMethods: 'All Payment Modes',
  allStatuses: 'All Statuses',
  reset: 'Reset',
  actions: 'Actions',
  viewAll: 'View All',
  close: 'Close',
  confirmDelete: 'Are you sure you want to delete this record?',

  // Fields & Tables
  receiptNumber: 'Receipt No.',
  voucherNumber: 'Voucher / Bill No.',
  billNumber: 'Bill / Voucher No.',
  donorName: 'Donor / Devotee Name',
  mobileNumber: 'Mobile Number',
  address: 'Address',
  amount: 'Amount (₹)',
  amountInWords: 'Amount in Words',
  date: 'Date',
  receivedDate: 'Received Date',
  type: 'Type',
  description: 'Description / Purpose',
  paymentMethod: 'Payment Method',
  category: 'Category',
  transactionRef: 'Transaction Ref (UTR / Cheque No)',
  notes: 'Remarks / Notes',
  vendorPaid: 'Paid To / Vendor Name',
  billReceipt: 'Bill / Receipt Copy',
  expenseTitle: 'Expense Title / Purpose',
  status: 'Status',
  receivedFrom: 'Received With Thanks From',
  receiptTitle: 'Shree Sai Mitra Mandal - Official Donation Receipt',
  receiptBlessing: 'May the divine blessings of Lord Ganesha & Sai Baba bring health, wealth, and joy to you and your family!',
  presidentSign: 'President / Chief Trustee',
  treasurerSign: 'Treasurer / Finance Lead',
  secretarySign: 'Secretary',

  // Statuses
  statusReceived: 'Received',
  statusPending: 'Pending',
  statusCancelled: 'Cancelled',
  received: 'Received',
  pending: 'Pending',
  cancelled: 'Cancelled',

  // Payment Methods
  cash: 'Cash',
  upi: 'UPI',
  bankTransfer: 'Bank Transfer (NEFT/RTGS)',
  cheque: 'Cheque',
  other: 'Other',

  // Donation Categories
  catGeneral: 'General Donation / Subscription',
  catAarti: 'Aarti & Pooja Seva',
  catPrasad: 'Maha Prasad / Annadan',
  catSilverGold: 'Special Sponsor / Patron',
  catMahaAarti: 'Maha Aarti Donation',
  catVisarjan: 'Visarjan Procession Fund',
  catAdvertisement: 'Banner / Advertisement',
  catOther: 'Other Inflow',

  // Expense Categories
  expDecoration: 'Pandal & Decoration',
  expIdol: 'Shree Ganesh',
  expLighting: 'Electrical & Lighting',
  expSound: 'Sound System & Speakers',
  expStage: 'Stage & Backdrop',
  expFlowers: 'Garlands & Flower Decor',
  expPrasad: 'Maha Prasad & Catering',
  expPooja: 'Pooja Materials & Rituals',
  expAdvertising: 'Advertising & Flex Banners',
  expPrinting: 'Receipt Books & Printing',
  expElectricity: 'Electricity & Generator Rent',
  expTransportation: 'Transport & Tempo Rent',
  expSecurity: 'Security & CCTV',
  expCleaning: 'Sanitation & Cleaning Supplies',
  expCultural: 'Cultural & Devotional Programs',
  expCharity: 'Social Welfare & Charity',
  expMisc: 'Miscellaneous Expenses',

  // Language switcher UI
  languageToggle: 'Language',
  selectLanguage: 'Select Language',
  marathi: 'मराठी',
  english: 'English',
};

// English Number to Words
function numberToEnglishWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  if (isNaN(amount)) return '';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += units[n] + ' ';
    }
    return str.trim();
  }

  let crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  let lakh = Math.floor(amount / 100000);
  amount %= 100000;
  let thousand = Math.floor(amount / 1000);
  amount %= 1000;
  let remaining = Math.floor(amount);

  let parts: string[] = [];
  if (crore > 0) parts.push(convertHundreds(crore) + ' Crore');
  if (lakh > 0) parts.push(convertHundreds(lakh) + ' Lakh');
  if (thousand > 0) parts.push(convertHundreds(thousand) + ' Thousand');
  if (remaining > 0) parts.push(convertHundreds(remaining));

  return (parts.join(' ') + ' Rupees Only').trim();
}

// Marathi Number to Words
function numberToMarathiWords(amount: number): string {
  if (amount === 0) return 'शून्य रुपये फक्त';
  if (isNaN(amount)) return '';

  const marathiUnits = [
    '', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
    'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस',
    'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस',
    'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकेचाळीस',
    'चाळीस', 'एक्केचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'शेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास',
    'पन्नास', 'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चौपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ',
    'साठ', 'एकसष्ठ', 'बासष्ठ', 'त्रेसष्ठ', 'चौसष्ठ', 'पासष्ठ', 'सहासष्ठ', 'सदुसष्ठ', 'अडुसष्ठ', 'एकोणसत्तर',
    'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौर्‍याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी',
    'ऐंशी', 'एक्क्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद',
    'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्व्याण्णव', 'शंभर'
  ];

  function convertHundredsMarathi(n: number): string {
    let str = '';
    if (n >= 100) {
      const h = Math.floor(n / 100);
      str += (h === 1 ? 'एकशे' : marathiUnits[h] + ' शे') + ' ';
      n %= 100;
    }
    if (n > 0) {
      str += marathiUnits[n] + ' ';
    }
    return str.trim();
  }

  let crore = Math.floor(amount / 10000000);
  amount %= 10000000;
  let lakh = Math.floor(amount / 100000);
  amount %= 100000;
  let thousand = Math.floor(amount / 1000);
  amount %= 1000;
  let remaining = Math.floor(amount);

  let parts: string[] = [];
  if (crore > 0) parts.push(convertHundredsMarathi(crore) + ' कोटी');
  if (lakh > 0) parts.push(convertHundredsMarathi(lakh) + ' लाख');
  if (thousand > 0) parts.push(convertHundredsMarathi(thousand) + ' हजार');
  if (remaining > 0) parts.push(convertHundredsMarathi(remaining));

  return (parts.join(' ') + ' रुपये फक्त').trim();
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
  formatDate: (dateString: string) => string;
  formatDateLocal: (dateString: string) => string;
  formatAmountInWords: (amount: number) => string;
  getPaymentMethodLabel: (method: string) => string;
  getDonationCategoryLabel: (category: string) => string;
  getExpenseCategoryLabel: (category: string) => string;
  getStatusLabel: (status: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'ssmm_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pure English exclusively
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = (_lang: Language) => {
    setLanguageState('en');
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguageState('en');
  };

  // Pure English translations
  const t = enTranslations;

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateLocal = formatDate;

  const formatAmountInWords = (amount: number): string => {
    return numberToEnglishWords(amount);
  };

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'Cash': return 'Cash';
      case 'UPI': return 'UPI';
      case 'Bank Transfer': return 'Bank Transfer';
      case 'Cheque': return 'Cheque';
      default: return method || 'Other';
    }
  };

  const getDonationCategoryLabel = (category: string): string => {
    switch (category) {
      case 'General':
      case 'General Donation':
        return 'General Donation';
      case 'Aarti / Pooja': return 'Aarti & Pooja Seva';
      case 'Prasad / Food': return 'Maha Prasad / Annadan';
      case 'Silver / Gold Sponsor': return 'Special Sponsor / Patron';
      case 'Maha Aarti': return 'Maha Aarti Donation';
      case 'Visarjan': return 'Visarjan Procession Fund';
      case 'Advertisement': return 'Banner / Advertisement';
      case 'Other': return 'Other Inflow';
      default: return category || 'General';
    }
  };

  const getExpenseCategoryLabel = (category: string): string => {
    switch (category) {
      case 'Decoration': return 'Pandal & Decoration';
      case 'Idol': return 'Shree Ganesh';
      case 'Lighting': return 'Electrical & Lighting';
      case 'Sound System': return 'Sound System & Speakers';
      case 'Stage': return 'Stage & Backdrop';
      case 'Flowers': return 'Garlands & Flower Decor';
      case 'Prasad/Food': return 'Maha Prasad & Catering';
      case 'Pooja Materials': return 'Pooja Materials & Rituals';
      case 'Advertising': return 'Advertising & Flex Banners';
      case 'Printing': return 'Receipt Books & Printing';
      case 'Electricity': return 'Electricity & Generator Rent';
      case 'Transportation': return 'Transport & Tempo Rent';
      case 'Security': return 'Security & CCTV';
      case 'Cleaning': return 'Sanitation & Cleaning Supplies';
      case 'Cultural Events': return 'Cultural & Devotional Programs';
      case 'Charity': return 'Social Welfare & Charity';
      default: return category || 'Miscellaneous';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'Received': return 'Received';
      case 'Pending': return 'Pending';
      case 'Cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatDate,
        formatDateLocal,
        formatAmountInWords,
        getPaymentMethodLabel,
        getDonationCategoryLabel,
        getExpenseCategoryLabel,
        getStatusLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
